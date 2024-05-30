import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

public class FileNetworkBuilder {

	private Database db = new Database();

	public void build() {
		try {
			db.connect();
			syntaxDependency();
			logicalDependency();
			workDependency();
			db.close();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// 文件的语法依赖：已由Understand工具抽取好，只要读取csv文件，写入db

	public void syntaxDependency() throws Exception {
		String sql = "SELECT DISTINCT version FROM changeset "
				+ "WHERE version IS NOT NULL ORDER BY version ASC ";
		ResultSet versionRS = db.executeQuery(sql);
		while (versionRS.next()) {
			String version = versionRS.getString(1);
			syntaxDependency(version);
		}
		versionRS.close();
	}

	/*
	 * 对于每一行数据，取出3个字段，插入
	 */
	public void syntaxDependency(String version) throws Exception {
		String tablename = "network_file_syntax_" + version.replace(".", "");
		if (db.tableExist(tablename)) {
			System.out.println("文件语法依赖表 version " + version + " 已存在！");
			return;
		} else {
			db.createFileTable(tablename);
		}

		String folder = version + "-stable";
		String filename = "/home/zwq/Software/fileDependencies/trac/"
				+ "trac_FileDependencies_" + folder + ".csv";
		File file = new File(filename);
		if (!file.exists())
			throw new FileNotFoundException();
		FileReader fr = new FileReader(file);
		BufferedReader br = new BufferedReader(fr);
		String line = br.readLine(); // 第一行忽略

		for (line = br.readLine(); line != null; line = br.readLine()) {
			String[] field = line.split(",");
			String file1 = field[0];
			String file2 = field[1];
			if (!file1.contains(folder) || !file2.contains(folder)) {
				continue;
			}
			file1 = file1.replace(folder + "/", "");
			file2 = file2.replace(folder + "/", "");
			int weight = Integer.parseInt(field[2]);
			db.addFileDependency(file1, file2, weight, tablename);
		}

		br.close();
		fr.close();
		System.out.println("文件语法依赖表 Version " + version + " 完成");
	}

	
	
	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// 文件的逻辑依赖：2个文件被一起提交

	public void logicalDependency() throws Exception {
		String sql = "SELECT DISTINCT version FROM changeset "
				+ "WHERE version IS NOT NULL ORDER BY version ASC ";
		ResultSet versionRS = db.executeQuery(sql);
		while (versionRS.next()) {
			String version = versionRS.getString(1);
			logicalDependency(version);
		}
		versionRS.close();
	}

	/*
	 * 找出所有changeset 对于每个changeset 找出所有文件 每两个文件间建立一条关系
	 */
	private void logicalDependency(String version) throws Exception {
		String tablename = "network_file_logic_" + version.replace(".", "");
		if (db.tableExist(tablename)) {
			System.out.println("文件逻辑依赖表 version " + version + " 已存在！");
			return;
		} else {
			db.createFileTable(tablename);
		}

		String sql = "SELECT id FROM changeset WHERE version = " + version;
		ResultSet changesetRS = db.executeQuery(sql);
		while (changesetRS.next()) {
			int changesetID = changesetRS.getInt(1);

			sql = "SELECT file FROM commit WHERE changesetid = ? ORDER BY file ASC";
			PreparedStatement stmt = db.conn.prepareStatement(sql);
			stmt.setInt(1, changesetID);
			ResultSet fileRS = stmt.executeQuery();

			List<String> filelist = new LinkedList<String>();
			while (fileRS.next()) {
				String file = fileRS.getString(1);
				if (file.equals("") || file.equals("."))
					continue;
				for (String f1 : filelist)
					db.addFileDependency(f1, file, tablename);
				filelist.add(file);
			}
			fileRS.close();
			stmt.close();
			System.out.println("Changeset " + changesetID + " 完成");
		}
		changesetRS.close();
		System.out.println("文件逻辑依赖表 Version " + version + " 完成");
	}

	
	
	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// 文件的工作依赖：两个文件隶属的changeset是为了一个ticket ！！ticket == 0 不算

	public void workDependency() throws Exception {
		String sql = "SELECT DISTINCT version FROM changeset "
				+ "WHERE version IS NOT NULL ORDER BY version ASC ";
		ResultSet versionRS = db.executeQuery(sql);
		while (versionRS.next()) {
			String version = versionRS.getString(1);
			workDependency(version);
		}
		versionRS.close();
	}

	/*
	 * 找出changeset涉及的所有ticket 对于每个ticket 找出所有changeset 对于每个changeset
	 * 与其他changeset搞一把
	 */
	public void workDependency(String version) throws Exception {
		String tablename = "network_file_work_" + version.replace(".", "");
		if (db.tableExist(tablename)) {
			System.out.println("文件工作依赖表 version " + version + " 已存在！");
			return;
		} else {
			db.createFileTable(tablename);
		}

		String sql = "SELECT DISTINCT ticketid FROM changeset WHERE version = ? and ticketid > 0 ORDER BY ticketid ASC";
		PreparedStatement ticketStmt = db.conn.prepareStatement(sql);
		ticketStmt.setString(1, version);
		ResultSet ticketRS = ticketStmt.executeQuery();

		while (ticketRS.next()) {
			int ticketid = ticketRS.getInt(1);

			sql = "SELECT id FROM changeset WHERE ticketid = ? ORDER BY id ASC";
			PreparedStatement stmt = db.conn.prepareStatement(sql);
			stmt.setInt(1, ticketid);
			ResultSet changesetRS = stmt.executeQuery();

			List<Integer> changesetList = new LinkedList<Integer>();
			while (changesetRS.next()) {
				int changesetID = changesetRS.getInt(1);
				changesetList.add(changesetID);
			}
			changesetRS.close();
			stmt.close();

			if (changesetList.size() > 1) {
				addWorkLink(changesetList, tablename);
				System.out.println("Ticket " + ticketid + " 完成");
			}
		}

		ticketRS.close();
		ticketStmt.close();
		System.out.println("文件工作依赖表 Version " + version + " 完成");
	}

	/*
	 * 找出每个changeset中的file 每个changeset中的file和其他changeset的file建立link
	 */
	private void addWorkLink(List<Integer> cidList, String table)
			throws Exception {
		List<List<String>> changeset = new LinkedList<List<String>>();
		for (Integer changesetID : cidList) {
			String sql = "SELECT file FROM commit WHERE changesetid = "
					+ changesetID;
			ResultSet fileRS = db.executeQuery(sql);

			List<String> fileset = new LinkedList<String>();
			while (fileRS.next()) {
				String file = fileRS.getString(1);
				if (file.equals("") || file.equals("."))
					continue;
				fileset.add(file);

				for (List<String> beforeSet : changeset) {
					for (String beforeFile : beforeSet) {
						if (beforeFile.equals(file)) { // 同一个文件指向自己的关系忽略
							continue;
						} else if (beforeFile.compareTo(file) < 0) {
							db.addFileDependency(beforeFile, file, table);
						} else {
							db.addFileDependency(file, beforeFile, table);
						}
					}
				}
			}
			fileRS.close();
			changeset.add(fileset);
		}
	}

}
