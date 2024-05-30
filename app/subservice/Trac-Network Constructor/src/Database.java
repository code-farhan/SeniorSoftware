
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

	// 增加一条文件依赖关系, 权重为weight (语法依赖专用)
	public void addFileDependency(String file1, String file2, int weight, String tablename) throws SQLException {
		String insert = "INSERT INTO " + tablename
				+ "(count,file1,file2) VALUES(?,?,?)";
		PreparedStatement insertStmt = conn.prepareStatement(insert);
		insertStmt.setInt(1, weight);
		insertStmt.setString(2, file1);
		insertStmt.setString(3, file2);
		insertStmt.executeUpdate();
		insertStmt.close();
	}


	// 增加一条文件依赖关系
	public void addFileDependency(String file1, String file2, String tablename) throws SQLException {

		// 查询记录是否存在（文件1，文件2）
		String query = "SELECT count FROM " + tablename
				+ " WHERE file1 = ? AND file2 = ?";
		PreparedStatement queryStmt = conn.prepareStatement(query);
		queryStmt.setString(1, file1);
		queryStmt.setString(2, file2);
		ResultSet resultSet = queryStmt.executeQuery();

		// 如果不存在，插入一条，count为1
		if (!resultSet.next()) {
			String insert = "INSERT INTO " + tablename
					+ "(count,file1,file2) VALUES(?,?,?)";
			PreparedStatement insertStmt = conn.prepareStatement(insert);
			insertStmt.setInt(1, 1);
			insertStmt.setString(2, file1);
			insertStmt.setString(3, file2);
			insertStmt.executeUpdate();
			insertStmt.close();

			// 如果存在，更新记录，count++
		} else {
			String update = "UPDATE " + tablename
					+ " SET count = ? WHERE file1 = ? AND file2 = ?";
			PreparedStatement updateStmt = conn.prepareStatement(update);
			int count = resultSet.getInt(1);
			updateStmt.setInt(1, count + 1);
			updateStmt.setString(2, file1);
			updateStmt.setString(3, file2);
			updateStmt.executeUpdate();
			updateStmt.close();
		}
		
		resultSet.close();
		queryStmt.close();
	}

	// 增加一条开发者依赖关系
	public void addDeveloperDependency(String developer1, String developer2, String tablename) throws SQLException {

		// 查询记录是否存在（开发者1，开发者2）
		String query = "SELECT count FROM " + tablename
				+ " WHERE developer1 = ? AND developer2 = ?";
		PreparedStatement queryStmt = conn.prepareStatement(query);
		queryStmt.setString(1, developer1);
		queryStmt.setString(2, developer2);
		ResultSet resultSet = queryStmt.executeQuery();

		// 如果不存在，插入一条，count为1
		if (!resultSet.next()) {
			String insert = "INSERT INTO " + tablename
					+ "(count,developer1,developer2) VALUES(?,?,?)";
			PreparedStatement insertStmt = conn.prepareStatement(insert);
			insertStmt.setInt(1, 1);
			insertStmt.setString(2, developer1);
			insertStmt.setString(3, developer2);
			insertStmt.executeUpdate();
			insertStmt.close();

			// 如果存在，更新记录，count++
		} else {
			String update = "UPDATE " + tablename
					+ " SET count = ? WHERE developer1 = ? AND developer2 = ?";
			PreparedStatement updateStmt = conn.prepareStatement(update);
			int count = resultSet.getInt(1);
			updateStmt.setInt(1, count + 1);
			updateStmt.setString(2, developer1);
			updateStmt.setString(3, developer2);
			updateStmt.executeUpdate();
			updateStmt.close();
		}
		
		resultSet.close();
		queryStmt.close();
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
	
	public void createFileTable(String table) throws SQLException {
		String sql = "CREATE TABLE " + table + "(file1 VARCHAR(128),file2 VARCHAR(128),count int," +
				"primary key(file1,file2))";
		PreparedStatement stmt = conn.prepareStatement(sql);
		stmt.executeUpdate();
		stmt.close();
		return;
	}
	
	public void createDeveloperTable(String table) throws SQLException {
		String sql = "CREATE TABLE " + table + "(developer1 VARCHAR(64),developer2 VARCHAR(64),count int," +
				"primary key(developer1,developer2))";
		PreparedStatement stmt = conn.prepareStatement(sql);
		stmt.executeUpdate();
		stmt.close();
		return;
	}
}
