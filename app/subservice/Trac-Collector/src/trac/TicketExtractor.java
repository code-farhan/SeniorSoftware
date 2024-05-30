package trac;

import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class TicketExtractor {

	private static String url = "http://trac.edgewall.org/ticket/";
	private static int min = 10549;
	private static int max = 11251;

	private static Database db = new Database();

	public static void run() {
		try {
			db.connect();
			for (; min <= max; min++) {
				try {
					extractPage(url + min);
				} catch (HttpStatusException e) {
					System.out.println("Ticket " + min + " 不存在");
					SimpleDateFormat sdf = new SimpleDateFormat(
							"yyyy-MM-dd HH:mm:ss");
					Date datetime = sdf.parse("1900-01-01 00:00:00");
					db.insertTicket(min, "", "", "", "", datetime, "", "", "",
							"", "", "", "", "", "", "", true);
				} catch (IOException e) {
					e.printStackTrace();
					System.out.println("网络错误");
					min--;
				}
			}
			db.close();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			System.out.println("JDBC驱动加载错误");
		} catch (SQLException e) {
			e.printStackTrace();
			System.out.println("SQL语法错误");
		} catch (ParseException e) {
			e.printStackTrace();
			System.out.println("抽取格式错误");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void extractPage(String url) throws IOException,
			ParseException, SQLException {
		Document doc = Jsoup
				.connect(url)
				.timeout(100000)
				.header(
						"User-Agent",
						"Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.2.17) Gecko/20110428 Fedora/3.6.17-1.fc13 Firefox/3.6.17")
				.header("Accept",
						"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
				.header("Accept-Language", "en-us").header("Accept-Encoding",
						"gzip,deflate").header("Accept-Charset",
						"GB2312,utf-8;q=0.7,*;q=0.7").header("Keep-Alive",
						"115").header("Connection", "keep-alive").get();

		// ticket id
		Element idEle = doc.select("a.trac-id").get(0);
		int id = Integer.parseInt(idEle.text().replace("#", "").trim());

		// statusInfo
		Element siEle = doc.select("#ticket > h2").get(0);
		String statusInfo = siEle.text();

		// status: new assigned fixed invalid cantfix
		Element statusEle = doc.select("span.trac-status > a").get(0);
		String status = statusEle.text().trim();
		if (status.equals("closed")) {
			Elements resoluEles = doc.select("span.trac-resolution > a");
			if (resoluEles.isEmpty()) {
				status = "closed";
			} else {
				status = resoluEles.first().text().trim();
			}
		}

		// type: defect enhancement
		Element typeEle = doc.select("span.trac-type > a").get(0);
		String type = typeEle.text().trim();

		// title
		Element titleEle = doc.select("#trac-ticket-title").get(0);
		String title = titleEle.text();

		// createTime
		Element ctimeEle = doc.select("#ticket > div.date > p > a.timeline")
				.get(0);
		Date timestamp = eleToTime(ctimeEle.attr("title"));

		// reporter
		Element reporterEle = doc.select("#h_reporter + td").first();
		String reporter = reporterEle.text().trim();

		// owner
		Element ownerEle = doc.select("#h_owner + td").first();
		String owner = ownerEle.text().trim();

		// priority
		Element priorityEle = doc.select("#h_priority + td").first();
		String priority = priorityEle.text().trim();

		// milestone
		Element milestoneEle = doc.select("#h_milestone + td").first();
		String milestone = milestoneEle.text().trim();

		// component
		Element componentEle = doc.select("#h_component + td").first();
		String component = componentEle.text().trim();

		// version
		Element versionEle = doc.select("#h_version + td").first();
		String version = versionEle.text().trim();

		// severity
		Element severityEle = doc.select("#h_severity + td").first();
		String severity = severityEle.text().trim();

		// keywords
		Element keywordsEle = doc.select("#h_keywords + td").first();
		String keywords = keywordsEle.text().trim();

		// cc
		Element ccEle = doc.select("#h_cc + td").first();
		String cc = ccEle.text().trim();

		// description
		Elements descriptionEles = doc.select("#addreply + div");
		String description = "";
		if (descriptionEles.size() != 0)
			description = descriptionEles.get(0).text().trim();

		// comment
		defaultCommentNum = -1;
		int currentNum = 0;
		Elements divs = doc.select("#changelog > div.change");
		for (int i = 0; i < divs.size(); i++) {
			Element commentEle = divs.get(i);
			int number = getCommentNumber(commentEle);
			String commenter = getCommenter(commentEle);
			Date commentTime = eleToTime(commentEle.getElementsByClass(
					"timeline").get(0).attr("title"));
			String comment = getComment(commentEle);
			int replyNum = getReplyNumber(commentEle);
			if (number > 0 && number <= currentNum) {
				number = defaultCommentNum--;
			}
			if (number > 0) {
				currentNum = number;
			}

//			if (number == 9 || number == 10 || number == 14 || number == 15) {
//				comment = "something weird";
//			}
			db.insertTicketComment(id, number, commenter, commentTime, comment,
					replyNum);
		}

		// description = "something about Chinese";
		// description = "something about Google";
		db.insertTicket(id, statusInfo, status, type, title, timestamp,
				reporter, owner, priority, milestone, component, version,
				severity, keywords, cc, description, false);

		System.out.println("Ticket " + id + " 完成");
	}

	private static int defaultCommentNum;

	// 时间文本转化为对象
	private static Date eleToTime(String text) throws ParseException {
		Pattern p = Pattern
				.compile("[A-Za-z]+ \\d\\d?, \\d\\d\\d\\d \\d\\d?:\\d\\d:\\d\\d \\DM");
		Matcher m = p.matcher(text);
		String str = null;
		if (m.find()) {
			str = m.group();
		}
		SimpleDateFormat sdf = new SimpleDateFormat("MMM d, yyyy h:mm:ss a",
				Locale.US);
		Date datetime = sdf.parse(str);
		return datetime;
	}

	// 获取评论人
	private static String getCommenter(Element commentEle) {
		Element titleEle = commentEle.getElementsByTag("h3").first();
		String titleStr = titleEle.text().trim();
		Pattern p = Pattern.compile("by [\\S\\s]+");
		Matcher m = p.matcher(titleStr);
		String byman = null;
		if (m.find()) {
			byman = m.group();
		}
		String man = byman.substring(3);
		return man;
	}

	// 获取评论编号
	private static int getCommentNumber(Element commentEle) {
		Element numEle = commentEle.getElementsByClass("cnum").first();
		if (numEle == null) {
			return defaultCommentNum--;
		}
		String numStr = numEle.text().trim();
		Pattern p = Pattern.compile("\\d+");
		Matcher m = p.matcher(numStr);
		int number = 0;
		if (m.find()) {
			number = Integer.parseInt(m.group());
		}
		return number;
	}

	// 获取评论
	private static String getComment(Element commentEle) {
		String comment = "";
		Elements changes = commentEle.getElementsByTag("li");
		for (int i = 0; i < changes.size(); i++) {
			comment += changes.get(i).text() + "\n";
		}
		Elements comments = commentEle.getElementsByClass("comment");
		if (comments.size() != 0) {
			comment += comments.get(0).text();
		}
		return comment;
	}

	// replynum：0（无回复），大于0（回复某条），小于0（回复description）
	private static int getReplyNumber(Element commentEle) {
		int number = 0;
		Elements ids = commentEle.getElementsByClass("threading");
		if (ids.size() != 0) {
			String text = ids.get(0).text();
			if (text.contains("reply")) {
				if (text.contains("description")) {
					number = -10000;
				} else {
					Element numEle = commentEle.getElementsByClass("cnum")
							.first();
					Element replyEle = numEle.nextElementSibling();
					String replyStr = replyEle.text().trim();
					Pattern p = Pattern.compile("\\d+");
					Matcher m = p.matcher(replyStr);
					String str = null;
					if (m.find()) {
						str = m.group();
					}
					number = Integer.parseInt(str);
				}
			}
		}
		return number;
	}

}
