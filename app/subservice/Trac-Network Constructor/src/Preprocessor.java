import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Preprocessor {

	private Database db = new Database();
	
	private int min = 1;
	private int max = 11251;
	private String newTable = "processedticket";
	
	/*
	 *	milestone: 修复bug的版本 (开发者网络出现的版本)
	 *	根据changeset来吧
	 */
	public void processTicket() {
		try {
			db.connect();
			
			setDeadlines();
			copyTickets();
			
			db.close();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} catch (ParseException e) {
			e.printStackTrace();
		}
	}
	
	// 遍历复制所有ticket
	private void copyTickets() throws SQLException, ParseException {
		for (int id = min; id <= max; id++) {
			copyOneTicket(id);
			System.out.println("Ticket " + id + " 完成！");
		}
	}
	
	// 复制一个ticket到processedticket
	private void copyOneTicket(int id) throws SQLException, ParseException {
		String sql = "SELECT absent, id, milestone, opentime FROM ticket WHERE id = ?";
		PreparedStatement queryStmt = db.conn.prepareStatement(sql);
		queryStmt.setInt(1, id);
		ResultSet queryRS = queryStmt.executeQuery();
		while (queryRS.next()) {
			int absent = queryRS.getInt(1);
			if (absent == 1) {
				continue;
			}
			id = queryRS.getInt(2);
			String milestone = queryRS.getString(3);
			String time = queryRS.getString(4);
			String processedMilestone = processMilestone(milestone, time);
			
			sql = "INSERT INTO " + newTable + "(id, milestone) VALUES(?,?)";
			PreparedStatement insertStmt = db.conn.prepareStatement(sql);
			insertStmt.setInt(1, id);
			insertStmt.setString(2, processedMilestone);
			insertStmt.executeUpdate();
			insertStmt.close();
		}
		queryRS.close();
		queryStmt.close();
	}
	
	// 设置milestone
	private String processMilestone(String milestone, String time) throws ParseException {
		Pattern p = Pattern.compile("\\d\\.\\d+");
		Matcher m = p.matcher(milestone);
		String result = null;
		if (m.find()) {
			result = m.group();
		} else {
			Date datetime = dbstrToDate(time);
			int i = 0;
			for (; i < deadlines.length; i++) {
				if (datetime.before(deadlines[i])) {
					break;
				}
			}
			result = versions[i];
		}
		return result;
	}
	
	// 设置各个版本的时间点
	private void setDeadlines() throws SQLException, ParseException {
		deadlines = new Date[firstTag.length];
		String sql = "SELECT committime FROM changeset WHERE id = ?";
		for (int i = 0; i < firstTag.length; i++) {
			PreparedStatement queryStmt = db.conn.prepareStatement(sql);
			queryStmt.setInt(1, firstTag[i]);
			ResultSet timeRS = queryStmt.executeQuery();
			String timeStr = null;
			if (timeRS.first())
				timeStr = timeRS.getString(1);
			timeRS.close();
			queryStmt.close();
			
			deadlines[i] = dbstrToDate(timeStr);
		}
	}
	
	// 数据库中的时间转化为Date对象
	private Date dbstrToDate(String time) throws ParseException {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.0");
		return sdf.parse(time);
	}
	
	private Date[] deadlines;
	private int[] firstTag = {183,314,551,1086,2438,3803,7236,9872,11307};
	private String[] versions = {"0.5","0.6","0.7","0.8","0.9",
		"0.10","0.11","0.12","1.0","1.1"};
}
