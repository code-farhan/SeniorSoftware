import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

public class DeveloperNetworkBuilder {

	private Database db = new Database();

	public void build() {
		try {
			db.connect();
			workDependency();
			commitDependency();
			commentDependency();
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
	// 2个开发者完成过同一个ticket !! ticket == 0不算 （权重 = ticket数）

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
	 * 在changeset表中找出所有ticket 对于每个ticket 找出所有author 每两个author建立关系
	 */
	public void workDependency(String version) throws Exception {
		String tablename = "network_developer_work_" + version.replace(".", "");
		if (db.tableExist(tablename)) {
			System.out.println("开发者工作依赖表 version " + version + " 已存在！");
			return;
		} else {
			db.createDeveloperTable(tablename);
		}

		String sql = "SELECT DISTINCT ticketid FROM changeset WHERE version = ? and ticketid > 0 ORDER BY ticketid ASC";
		PreparedStatement ticketStmt = db.conn.prepareStatement(sql);
		ticketStmt.setString(1, version);
		ResultSet ticketRS = ticketStmt.executeQuery();

		while (ticketRS.next()) {
			int ticketID = ticketRS.getInt(1);

			sql = "SELECT DISTINCT author FROM changeset WHERE ticketid = ? ORDER BY author ASC";
			PreparedStatement stmt = db.conn.prepareStatement(sql);
			stmt.setInt(1, ticketID);
			ResultSet developerRS = stmt.executeQuery();

			List<String> developerlist = new LinkedList<String>();
			while (developerRS.next()) {
				String developer = developerRS.getString(1);
				for (String developer1 : developerlist) {
					db.addDeveloperDependency(developer1, developer, tablename);
				}
				developerlist.add(developer);
			}
			developerRS.close();
			stmt.close();
			System.out.println("Ticket " + ticketID + " 完成");
		}
		ticketRS.close();
		ticketStmt.close();
		System.out.println("开发者工作依赖表 Version " + version + " 完成");
	}

	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// ///////////////////////////////////////////////////////////////////////////////////////////////////////
	// 2个开发者提交过同一个文件 （权重 = 文件数）

	public void commitDependency() throws Exception {
		String sql = "SELECT DISTINCT version FROM changeset "
				+ "WHERE version IS NOT NULL ORDER BY version ASC ";
		ResultSet versionRS = db.executeQuery(sql);
		while (versionRS.next()) {
			String version = versionRS.getString(1);
			commitDependency(version);
		}
		versionRS.close();
	}

	/*
	 * 找出所有文件（distinct） 对于每个文件 找出所有开发者（distinct） 两两间建立关系
	 */
	public void commitDependency(String version) throws SQLException {
		String tablename = "network_developer_commit_"
				+ version.replace(".", "");
		if (db.tableExist(tablename)) {
			System.out.println("开发者提交关系表 version " + version + " 已存在！");
			return;
		} else {
			db.createDeveloperTable(tablename);
		}

		String sql = "SELECT DISTINCT file FROM commit WHERE changesetid IN "
				+ "(SELECT id FROM changeset WHERE version = ?)";
		PreparedStatement fileStmt = db.conn.prepareStatement(sql);
		fileStmt.setString(1, version);
		ResultSet fileRS = fileStmt.executeQuery();

		while (fileRS.next()) {
			String file = fileRS.getString(1);
			if (file.equals("") || file.equals(".")) {
				continue;
			}

			sql = "SELECT DISTINCT author FROM changeset WHERE version = ? AND "
					+ "id IN (SELECT DISTINCT changesetid FROM commit WHERE file = ?) "
					+ "ORDER BY author ASC";
			PreparedStatement developerStmt = db.conn.prepareStatement(sql);
			developerStmt.setString(1, version);
			developerStmt.setString(2, file);
			ResultSet developerRS = developerStmt.executeQuery();

			List<String> developerlist = new LinkedList<String>();
			while (developerRS.next()) {
				String developer = developerRS.getString(1);
				for (String developer1 : developerlist) {
					db.addDeveloperDependency(developer1, developer, tablename);
				}
				developerlist.add(developer);
			}
			developerRS.close();
			developerStmt.close();
		}

		fileRS.close();
		fileStmt.close();
		System.out.println("开发者提交关系表 Version " + version + " 完成");
	}

	
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2个开发者评论过同一个ticket （不在开发者中的用户怎么办？过滤掉）

	public void commentDependency() throws Exception {
		String sql = "SELECT DISTINCT milestone FROM processedticket ORDER BY milestone ASC";
		ResultSet versionRS = db.executeQuery(sql);
		while (versionRS.next()) {
			String version = versionRS.getString(1);
			commentDependency(version);
		}
		versionRS.close();
	}

	/*
	 * 在processedticket表中找出所有该version的ticket 对于每个ticket
	 * 在processedcomment中找出所有commenter 每2个commentor间建一条联系
	 */
	public void commentDependency(String version) throws Exception {
		String tablename = "network_developer_comment_"
				+ version.replace(".", "");
		if (db.tableExist(tablename)) {
			System.out.println("开发者评论依赖表 version " + version + " 已存在！");
			return;
		} else {
			db.createDeveloperTable(tablename);
		}

		String sql = "SELECT id FROM processedticket WHERE milestone = ?";
		PreparedStatement ticketStmt = db.conn.prepareStatement(sql);
		ticketStmt.setString(1, version);
		ResultSet ticketRS = ticketStmt.executeQuery();

		while (ticketRS.next()) {
			int ticketID = ticketRS.getInt(1);

			sql = "SELECT DISTINCT commenter FROM processedcomment "
					+ "WHERE ticketid = ? ORDER BY commenter ASC";
			PreparedStatement commenterStmt = db.conn.prepareStatement(sql);
			commenterStmt.setInt(1, ticketID);
			ResultSet commenterRS = commenterStmt.executeQuery();

			List<String> commenterList = new LinkedList<String>();
			while (commenterRS.next()) {
				String commenter = commenterRS.getString(1);
				for (String commenter1 : commenterList) {
					db.addDeveloperDependency(commenter1, commenter, tablename);
				}
				commenterList.add(commenter);
			}

			commenterRS.close();
			commenterStmt.close();
		}
		ticketRS.close();
		ticketStmt.close();
		System.out.println("开发者评论依赖表 Version " + version + " 完成");
	}

}
