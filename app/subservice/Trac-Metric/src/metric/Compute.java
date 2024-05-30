package metric;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

public class Compute {

	private Database db = new Database();
	
	final String[] versions = {"0.5","0.6","0.7","0.8","0.9",
			"0.10","0.11","0.12","1.0","1.1"};
	
	public void run() {
		try {
			db.connect();
			// 最后1个版本未结束，不考虑
			for (int vi = 0; vi < versions.length - 1; vi++) {
				computeForVersion(vi);
			}
			db.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
//	// 文件转化后的表：语法：1，逻辑：2，工作：3
//	final String[] fileTables = {"network_file_syntax_","network_file_logic_","network_file_work_"};
//	// 开发者表：提交：1，工作：2，评论：3
//	final String[] developerTables = {"network_developer_commit_","network_developer_work_","network_developer_comment_"};

	private void computeForVersion(int vi) throws Exception {
		String resultTable = "metric_" + versions[vi].replace(".", "");
		if (db.tableExist(resultTable)) {
			System.out.println(resultTable + " 已存在！");
			return;
		} else {
			db.createMetricTable(resultTable);
		}
		
/////////// 读文件, 计算代码度量/////////////////
		String filename = "/home/zwq/Experiment/trac/fileMetric/" + versions[vi] + ".csv";
		File excel = new File(filename);
		if (!excel.exists())
			throw new FileNotFoundException();
		FileReader fr = new FileReader(excel);
		BufferedReader br = new BufferedReader(fr);
		String line = br.readLine(); // 第一行忽略
		for (line = br.readLine(); line != null; line = br.readLine()) {
			String[] field = line.split(",");
			if (!field[0].equals("File")) {
				continue;
			}
			String file = getFile(field[1], vi);
			int loc = stringToInt(field[2]);
			int quan = 0;
			int ben = 0;
			if (field.length > 3) {
				quan = stringToInt(field[3]);
				ben = stringToInt(field[4]);
			}

/////////// 5种文件网络中相关文件数/////////////////
			Set<String> s_fSet = getNeighborFileSet(file, "network_file_syntax_", vi);
			Set<String> l_fSet = getNeighborFileSet(file, "network_file_logic_", vi);
			Set<String> w_fSet = getNeighborFileSet(file, "network_file_work_", vi);
			
			int s_linfile = s_fSet.size();
			int l_linfile = l_fSet.size();
			int w_linfile = w_fSet.size();
			Set<String> lw_fSet = l_fSet;
			lw_fSet.addAll(w_fSet);
			int lw_linfile = lw_fSet.size();
			Set<String> slw_fSet = lw_fSet;
			slw_fSet.addAll(s_fSet);
			int slw_linfile = slw_fSet.size();

/////////// 修改次数、开发者数/////////////////
			int changenum = getChange(file, vi);
			Set<String > dSet = getDeveloperSet(file, versions[vi]);
			int developer = dSet.size();

/////////// 5种文件网络中相关文件的开发者数/////////////////			
			Set<String> s_cdSet = getConnectedDeveloperSet(file, "network_file_syntax_", vi);
			Set<String> l_cdSet = getConnectedDeveloperSet(file, "network_file_logic_", vi);
			Set<String> w_cdSet = getConnectedDeveloperSet(file, "network_file_work_", vi);
			s_cdSet.addAll(dSet);
			l_cdSet.addAll(dSet);
			w_cdSet.addAll(dSet);
			int s_cDev = s_cdSet.size();
			int l_cDev = l_cdSet.size();
			int w_cDev = w_cdSet.size();
			Set<String> lw_cdSet = l_cdSet;
			lw_cdSet.addAll(w_cdSet);
			int lw_cDev = lw_cdSet.size();
			Set<String> slw_cdSet = lw_cdSet;
			slw_cdSet.addAll(s_cdSet);
			int slw_cDev = slw_cdSet.size();

/////////// 3种开发者网络中的相关开发者数/////////////////
			Set<String> commit_ndSet =  new HashSet<String>();
			Set<String> work_ndSet =  new HashSet<String>();
			Set<String> comment_ndSet =  new HashSet<String>();
			commit_ndSet.addAll(dSet);
			work_ndSet.addAll(dSet);
			comment_ndSet.addAll(dSet);
			for (String dev: dSet) {
				commit_ndSet.addAll(getNetworkDeveloperSet(dev, "network_developer_commit_", vi));
				work_ndSet.addAll(getNetworkDeveloperSet(dev, "network_developer_work_", vi));
				comment_ndSet.addAll(getNetworkDeveloperSet(dev, "network_developer_comment_", vi));
			}
			Set<String> cw_ndSet = commit_ndSet;
			cw_ndSet.addAll(work_ndSet);
			int cw_nDev = cw_ndSet.size();
			Set<String> c_ndSet = comment_ndSet;
			int c_nDev = c_ndSet.size();
			Set<String> cwc_ndSet = cw_ndSet;
			cwc_ndSet.addAll(c_ndSet);
			int cwc_nDev = cwc_ndSet.size();

/////////// bug数/////////////////
			int thisbug = getBug(file, versions[vi]);
			int nextbug = getBug(file, versions[vi+1]);

/////////// 网络比较度量（5*4）/////////////////
			Set<String> s_dSet = getConnectedDeveloperSet(file, "network_file_syntax_", vi);
			List<Edge> s_list = createEdgeList(dSet, s_dSet);
			int s_a = s_list.size();
			int s_cw = getCW(s_list, versions[vi]);
			int s_c = getC(s_list, versions[vi]);
			int s_cwc = getCWC(s_list, versions[vi]);
			
			Set<String> l_dSet = getConnectedDeveloperSet(file, "network_file_logic_", vi);
			List<Edge> l_list = createEdgeList(dSet, l_dSet);
			int l_a = l_list.size();
			int l_cw = getCW(l_list, versions[vi]);
			int l_c = getC(l_list, versions[vi]);
			int l_cwc = getCWC(l_list, versions[vi]);

			Set<String> w_dSet = getConnectedDeveloperSet(file, "network_file_work_", vi);
			List<Edge> w_list = createEdgeList(dSet, w_dSet);
			int w_a = w_list.size();
			int w_cw = getCW(w_list, versions[vi]);
			int w_c = getC(w_list, versions[vi]);
			int w_cwc = getCWC(w_list, versions[vi]);

			Set<String> lw_dSet = l_dSet;
			lw_dSet.addAll(w_dSet);
			List<Edge> lw_list = createEdgeList(dSet, lw_dSet);
			int lw_a = lw_list.size();
			int lw_cw = getCW(lw_list, versions[vi]);
			int lw_c = getC(lw_list, versions[vi]);
			int lw_cwc = getCWC(lw_list, versions[vi]);

			Set<String> slw_dSet = s_dSet;
			slw_dSet.addAll(lw_dSet);
			List<Edge> slw_list = createEdgeList(dSet, slw_dSet);
			int slw_a = slw_list.size();
			int slw_cw = getCW(slw_list, versions[vi]);
			int slw_c = getC(slw_list, versions[vi]);
			int slw_cwc = getCWC(slw_list, versions[vi]);
			
////////// 插入 //////////////////
			db.insertMetric(resultTable, file, 
					loc, quan, ben, 
					s_linfile, l_linfile, w_linfile, lw_linfile, slw_linfile,
					changenum, developer, 
					s_cDev, l_cDev, w_cDev, lw_cDev, slw_cDev,
					cw_nDev, c_nDev, cwc_nDev,
					thisbug, nextbug,
					s_a, s_cw, s_c, s_cwc,
					l_a, l_cw, l_c, l_cwc,
					w_a, w_cw, w_c, w_cwc,
					lw_a, lw_cw, lw_c, lw_cwc,
					slw_a, slw_cw, slw_c, slw_cwc
					);
		}
		
		br.close();
		fr.close();
		System.out.println(versions[vi] + " 完成");
	}
	
	// 将文件中的文件名提取出来
	private String getFile (String s, int vi) {
		String pre = versions[vi] + "-stable/";
		String file = s.replace(pre, "");
		file = file.replace("\"", "");
		return file;
	}
	
	// 字符串转整型（默认为0）
	private int stringToInt (String s) {
		int result = 0;
		try {
			result = Integer.parseInt(s);
		} catch (NumberFormatException e) {
			System.out.println("非数字");
		}
		return result;
	}

	// 计算该文件在文件网络中相关的文件数量（度数）s, l, w
	private Set<String> getNeighborFileSet(String file, 
			String tablePre, int vi) throws SQLException {
		Set<String> fileSet = new HashSet<String>();
		String table = tablePre + versions[vi].replace(".", "");
		
		String sql1 = "SELECT DISTINCT file1 FROM " + table + " WHERE file2 = ?";
		PreparedStatement ps1 = db.conn.prepareStatement(sql1);
		ps1.setString(1, file);
		ResultSet rs1 = ps1.executeQuery();
		while (rs1.next()) {
			String file1 = rs1.getString(1);
			fileSet.add(file1);
		}
		rs1.close();
		ps1.close();		
		
		String sql2 = "SELECT DISTINCT file2 FROM " + table + " WHERE file1 = ?";
		PreparedStatement ps2 = db.conn.prepareStatement(sql2);
		ps2.setString(1, file);
		ResultSet rs2 = ps2.executeQuery();
		while (rs2.next()) {
			String file2 = rs2.getString(1);
			fileSet.add(file2);
		}
		rs2.close();
		ps2.close();	
		
		return fileSet;
	}

	// 计算该文件在该版本的修改次数	
	private int getChange(String file, int vi) throws SQLException {
		String sql = "SELECT SUM(num) FROM filedeveloper WHERE version = ? AND file = ?";
		PreparedStatement changePS = db.conn.prepareStatement(sql);
		changePS.setString(1, versions[vi]);
		changePS.setString(2, file);
		ResultSet changeRS = changePS.executeQuery();
		int change = 0;
		while (changeRS.next()) {
			change = changeRS.getInt(1);
		}
		changeRS.close();
		changePS.close();
		return change;
	}

	// 计算在该版本中修改过该文件的开发者集合
	private Set<String> getDeveloperSet(String file, String version) throws SQLException {
		String sql = "SELECT developer FROM filedeveloper WHERE version = ? AND file = ?";
		PreparedStatement developerPS = db.conn.prepareStatement(sql);
		developerPS.setString(1, version);
		developerPS.setString(2, file);
		ResultSet developerRS = developerPS.executeQuery();
		Set<String> developerSet = new HashSet<String>();
		while (developerRS.next()) {
			String developer = developerRS.getString(1);
			developerSet.add(developer);
		}
		developerRS.close();
		developerPS.close();
		return developerSet;
	}
	
	// 计算在该版本与该文件相关的文件，它们的开发者的集合
	private Set<String> getConnectedDeveloperSet(String file, 
			String tablePre, int vi) throws SQLException {
		String table = tablePre + versions[vi].replace(".","");
		String sql = "SELECT  DISTINCT fd.developer FROM filedeveloper fd, " +
				table + " t WHERE fd.version = ? AND " +
				"((t.file1 = ? AND t.file2 = fd.file) OR " +
				"(t.file2 = ? AND t.file1 = fd.file))";
		PreparedStatement developerPS = db.conn.prepareStatement(sql);
		developerPS.setString(1, versions[vi]);
		developerPS.setString(2, file);
		developerPS.setString(3, file);
		ResultSet developerRS = developerPS.executeQuery();
		Set<String> developerSet = new HashSet<String>();
		while (developerRS.next()) {
			String developer = developerRS.getString(1);
			developerSet.add(developer);
		}
		developerRS.close();
		developerPS.close();
		return developerSet;
	}

	// 计算在开发者网络中，与该文件的开发者相连的开发者集合
	private Set<String> getNetworkDeveloperSet(String developer, 
			String tablePre, int vi) throws SQLException {
		String table = tablePre + versions[vi].replace(".","");
		Set<String> developerSet = new HashSet<String>();
		
		String sql;
		sql = "SELECT DISTINCT developer1 FROM " + table + " WHERE developer2 = ?";
		PreparedStatement ps = db.conn.prepareStatement(sql);
		ps.setString(1, developer);
		ResultSet rs = ps.executeQuery();
		while (rs.next()) {
			String dev = rs.getString(1);
			developerSet.add(dev);
		}
		rs.close();
		ps.close();		

		sql = "SELECT DISTINCT developer2 FROM " + table + " WHERE developer1 = ?";
		ps = db.conn.prepareStatement(sql);
		ps.setString(1, developer);
		rs = ps.executeQuery();
		while (rs.next()) {
			String dev = rs.getString(1);
			developerSet.add(dev);
		}
		rs.close();
		ps.close();
		
		return developerSet;
	}

	// 计算该文件在该版本的bug数
	private int getBug(String file, String version) throws SQLException {
		String sql = "SELECT bugnum FROM filebug WHERE version = ? AND file = ?";
		PreparedStatement bugPS = db.conn.prepareStatement(sql);
		bugPS.setString(1, version);
		bugPS.setString(2, file);
		ResultSet bugRS = bugPS.executeQuery();
		int bug = 0;
		while (bugRS.next()) {
			bug = bugRS.getInt(1);
		}
		bugRS.close();
		bugPS.close();
		return bug;
	}

	// 计算2个开发者集合间应该存在的边的集合
	List<Edge> createEdgeList(Set<String> set1, Set<String> set2) {
		List<Edge> edgelist = new LinkedList<Edge>();
		for (String developer1: set1) {
			for (String developer2: set2) {
				if (developer1.equals(developer2)){
					continue;
				}
				Edge edge = new Edge(developer1, developer2);
				boolean notExist = true;
				for (Edge e: edgelist) {
					if (e.equals(edge)){
						notExist = false;
						break;
					}
				}
				if (notExist) {
					edgelist.add(edge);
				}
			}
		}
		return edgelist;
	}
	
	// 在commit+work网络中存在的边的数量
	private int getCW(List<Edge> edgelist, String version) throws SQLException {
		String table1 = "network_developer_commit_" + version.replace(".","");
		String table2 = "network_developer_work_" + version.replace(".","");
		int count = 0;
		for (Edge edge: edgelist) {
			if (hasEdge(edge, table1) || hasEdge(edge, table2)) {
				count++;
			}
		}
		return count;
	}
	
	// 在comment网络中存在的边的数量
	private int getC(List<Edge> edgelist, String version) throws SQLException {
		String table1 = "network_developer_comment_" + version.replace(".","");
		int count = 0;
		for (Edge edge: edgelist) {
			if (hasEdge(edge, table1)) {
				count++;
			}
		}
		return count;
	}

	// 在commit+work+comment网络中存在的边的数量
	private int getCWC(List<Edge> edgelist, String version) throws SQLException {
		String table1 = "network_developer_commit_" + version.replace(".","");
		String table2 = "network_developer_work_" + version.replace(".","");
		String table3 = "network_developer_comment_" + version.replace(".","");
		int count = 0;
		for (Edge edge: edgelist) {
			if (hasEdge(edge, table1) || hasEdge(edge, table2) || hasEdge(edge, table3)) {
				count++;
			}
		}
		return count;
	}
	
	// 某条边是否存在（2个开发者是否有关）
	private boolean hasEdge(Edge edge, String table) throws SQLException {
		boolean result = false;
		String sql = "SELECT developer1 FROM " + table + " " +
				"WHERE developer1 = ? AND developer2 = ?";
		PreparedStatement developerPS = db.conn.prepareStatement(sql);
		developerPS.setString(1, edge.developer1);
		developerPS.setString(2, edge.developer2);
		ResultSet developerRS = developerPS.executeQuery();
		while (developerRS.next()) {
			result = true;
		}
		developerRS.close();
		developerPS.close();
		return result;
	}

}
