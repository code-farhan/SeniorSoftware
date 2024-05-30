package metric;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class Database {

	String driver = "com.mysql.jdbc.Driver";
	String url = "jdbc:mysql://127.0.0.1:3306/trac";
	String user = "root";
	String passwd = "123456";

	Connection conn = null;
	
	// 连接数据库
	public void connect() throws ClassNotFoundException, SQLException {
		Class.forName(driver);
		conn = DriverManager.getConnection(url, user, passwd);
	}

	// 断开数据库连接
	public void close() throws SQLException {
		conn.close();
	}

	public void removeTable(String table) throws SQLException {
		String sql = "drop table " + table;
		PreparedStatement stmt = conn.prepareStatement(sql);
		stmt.executeUpdate();
		stmt.close();
	}
	
	public ResultSet executeQuery(String sql) throws Exception {
		PreparedStatement preparedStatement = conn.prepareStatement(sql);
		ResultSet resultSet = preparedStatement.executeQuery();
		return resultSet;
	}

	public boolean tableExist(String table) throws SQLException {
		boolean result = false;
		String sql = "SHOW TABLES LIKE ?";
		PreparedStatement stmt = conn.prepareStatement(sql);
		stmt.setString(1, table);
		ResultSet rs = stmt.executeQuery();
		if (rs.next()) {
			result = true;
		}
		rs.close();
		stmt.close();
		return result;
	}
	
	public void insertMetric(String table, String file,
			int loc, int quan, int ben, 
			int s_linfile, int l_linfile, int w_linfile, int lw_linfile, int slw_linfile,
			int change, int developer, 
			int s_cdev, int l_cdev, int w_cdev, int lw_cdev, int slw_cdev, 
			int cw_ndev, int c_ndev, int cwc_ndev, 
			int thisbug, int nextbug, 
			int s_a, int s_cw, int s_c, int s_cwc,
			int l_a, int l_cw, int l_c, int l_cwc,
			int w_a, int w_cw, int w_c, int w_cwc,
			int lw_a, int lw_cw, int lw_c, int lw_cwc,
			int slw_a, int slw_cw, int slw_c, int slw_cwc
			) throws SQLException {
		String sql = "INSERT INTO " + table + "(" +
				"file, loc, quan, ben, " +
				"s_linfile, l_linfile, w_linfile, lw_linfile, slw_linfile, " +
				"changenum, developer, " +
				"s_cdeveloper, l_cdeveloper, w_cdeveloper, lw_cdeveloper, slw_cdeveloper, " +
				"cw_ndeveloper, c_ndeveloper, cwc_ndeveloper, " +
				"thisbug, nextbug," +
				"s_a, s_cw, s_c, s_cwc, " +
				"l_a, l_cw, l_c, l_cwc, " +
				"w_a, w_cw, w_c, w_cwc, " +
				"lw_a, lw_cw, lw_c, lw_cwc, " +
				"slw_a, slw_cw, slw_c, slw_cwc" +
				") VALUES(?,?,?,?,  ?,?,?,?,?,  ?,?, " +
				"?,?,?,?,?,  ?,?,?,  ?,?, " +
				"?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?,?)";
		PreparedStatement stmt = conn.prepareStatement(sql);
		stmt.setString(1, file);
		stmt.setInt(2, loc);
		stmt.setInt(3, quan);
		stmt.setInt(4, ben);
		stmt.setInt(5, s_linfile);
		stmt.setInt(6, l_linfile);
		stmt.setInt(7, w_linfile);
		stmt.setInt(8, lw_linfile);
		stmt.setInt(9, slw_linfile);
		stmt.setInt(10, change);
		stmt.setInt(11, developer);
		stmt.setInt(12, s_cdev);
		stmt.setInt(13, l_cdev);
		stmt.setInt(14, w_cdev);
		stmt.setInt(15, lw_cdev);
		stmt.setInt(16, slw_cdev);
		stmt.setInt(17, cw_ndev);
		stmt.setInt(18, c_ndev);
		stmt.setInt(19, cwc_ndev);
		stmt.setInt(20, thisbug);
		stmt.setInt(21, nextbug);
		stmt.setInt(22, s_a);
		stmt.setInt(23, s_cw);
		stmt.setInt(24, s_c);
		stmt.setInt(25, s_cwc);
		stmt.setInt(26, l_a);
		stmt.setInt(27, l_cw);
		stmt.setInt(28, l_c);
		stmt.setInt(29, l_cwc);
		stmt.setInt(30, w_a);
		stmt.setInt(31, w_cw);
		stmt.setInt(32, w_c);
		stmt.setInt(33, w_cwc);
		stmt.setInt(34, lw_a);
		stmt.setInt(35, lw_cw);
		stmt.setInt(36, lw_c);
		stmt.setInt(37, lw_cwc);
		stmt.setInt(38, slw_a);
		stmt.setInt(39, slw_cw);
		stmt.setInt(40, slw_c);
		stmt.setInt(41, slw_cwc);
		stmt.executeUpdate();
		stmt.close();
	}
	
	public void createMetricTable(String table) throws SQLException {
		String sql = "CREATE TABLE " + table + "(file VARCHAR(128) PRIMARY KEY, " +
				"loc int, quan int, ben int, " +
				"s_linfile int, l_linfile int, w_linfile int, lw_linfile int, slw_linfile int, " +
				"changenum int, developer int, " + 
				"s_cdeveloper int, l_cdeveloper int, w_cdeveloper int, lw_cdeveloper int, slw_cdeveloper int, " +
				"cw_ndeveloper int, c_ndeveloper int, cwc_ndeveloper int, " +
				"thisbug int, nextbug int, " +
				"s_a int, s_cw int, s_c int, s_cwc int, " +
				"l_a int, l_cw int, l_c int, l_cwc int, " +
				"w_a int, w_cw int, w_c int, w_cwc int, " +
				"lw_a int, lw_cw int, lw_c int, lw_cwc int, " +
				"slw_a int, slw_cw int, slw_c int, slw_cwc int" +
				")";
		PreparedStatement stmt = conn.prepareStatement(sql);
		stmt.executeUpdate();
		stmt.close();
		return;
	}

	/*
	 *  s:syntax, l:logic, w:work, lw:logic+work, slw:syntax+logic+work
	 *  cw:commit+work, c:comment, cwc:commit+work+comment
	 * 	 a:all, e:exist
	 */
}
