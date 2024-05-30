package trac;


import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;


public class Database {

	String driver = "com.mysql.jdbc.Driver";
	String url = "jdbc:mysql://127.0.0.1:3306/trac";
	String user = "root";
	String passwd = "";
	
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
	
	// 插入一条changeset 
	public void insertChangeset(int id, String author, int ticketid, Date datetime,
			String message, String location, String version) throws SQLException {
		String sqlStr = "INSERT INTO changeset(id, author, ticketid, committime, message, location, version)" +
				"VALUES(?,?,?,?,?,?,?)";
		PreparedStatement stmt = conn.prepareStatement(sqlStr);
		stmt.setInt(1, id);
		stmt.setString(2, author);
		stmt.setInt(3, ticketid);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		String timestamp = sdf.format(datetime);
		stmt.setString(4, timestamp);
		stmt.setString(5, message);
		stmt.setString(6, location);
		stmt.setString(7, version);
		stmt.executeUpdate();
		stmt.close();
	}
	
	// 插入一条commit
	public void insertCommit(int changesetID, String file,
			String type) throws SQLException {
		String sqlStr = "INSERT INTO commit(changesetid, file, type) VALUES(?,?,?)";
		PreparedStatement stmt = conn.prepareStatement(sqlStr);
		stmt.setInt(1, changesetID);
		stmt.setString(2, file);
		stmt.setString(3, type);
		stmt.executeUpdate();
		stmt.close();
	}
	
	/*
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		Database db = new Database();
		try {
			Date date = Calendar.getInstance().getTime();
			db.connect();
//			db.insertChangeset(22, "zwq", 23, date, "hehehehehehe");
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			Date datetime = sdf.parse("2000-11-11 11:11:11");
			db.insertTicketComment(1111,1,"ren",datetime, "neirong",0);
			db.close();
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	} */
	
	// 插入一条ticket
	public void insertTicket(int id, String statusInfo, String status,
			String type, String title, Date timestamp, String reporter,
			String owner, String priority, String milestone, String component,
			String version, String severity, String keywords, String cc,
			String description, boolean isAbsent) throws SQLException {
		String sqlStr = "INSERT INTO ticket(id, statusinfo, status, type, title," +
				"opentime, reporter, owner, priority, milestone, component, version," +
				"severity, keywords, cc, description, absent) VALUES(?,?,?,?,?,"+"?,?,?,?,?,"+"?,?,?,?,?,"+"?,?)";
		PreparedStatement stmt = conn.prepareStatement(sqlStr);
		stmt.setInt(1, id);
		stmt.setString(2, statusInfo);
		stmt.setString(3, status);
		stmt.setString(4, type);
		stmt.setString(5, title);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		String timeStr = sdf.format(timestamp);
		stmt.setString(6, timeStr);
		stmt.setString(7, reporter);
		stmt.setString(8, owner);
		stmt.setString(9, priority);
		stmt.setString(10, milestone);
		stmt.setString(11, component);
		stmt.setString(12, version);
		stmt.setString(13, severity);
		stmt.setString(14, keywords);
		stmt.setString(15, cc);
		stmt.setString(16, description);
		int absent = 0;
		if (isAbsent)
			absent = 1;
		stmt.setInt(17, absent);
		stmt.executeUpdate();
		stmt.close();
	}

	// 插入一条comment
	public void insertTicketComment(int id, int number, String commenter,
			Date commentTime, String comment, int replyNum) throws SQLException {
		String sqlStr = "INSERT INTO comment(ticketid, number, commenter, commenttime, comment, replynum)" +
				"VALUES(?,?,?,?,?,?)";
		PreparedStatement stmt = conn.prepareStatement(sqlStr);
		stmt.setInt(1, id);
		stmt.setInt(2, number);
		stmt.setString(3, commenter);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		String timeStr = sdf.format(commentTime);
		stmt.setString(4, timeStr);
		stmt.setString(5, comment);
		stmt.setInt(6, replyNum);
		stmt.executeUpdate();
		stmt.close();
	}
	
	
	   public ResultSet executeQuery(String sql) throws Exception {
		   PreparedStatement preparedStatement = conn.prepareStatement(sql);
		   ResultSet resultSet = preparedStatement.executeQuery();
		   return resultSet;
	    }
		
}
