package trac;

import java.io.IOException;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class ChangesetExtractor {

	private static String url = "http://trac.edgewall.org/changeset/";
	private static int min = 7751;
	//private static int cur = min;
	private static int max = 11850;

	private static Database db = new Database();


	public static void run() {
		try {
			db.connect();
			for (; min <= max; min++) {
				try {
					extractPage(url + min);
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

		// changeset id
		Element idEle = doc.select("#title").get(0);
		int id = titleToID(idEle.text());

		// changeset timestamp
		Element timestampEle = doc.select("#overview > dd.time").get(0);
		Date timestamp = elementToTime(timestampEle.text());

		// changeset author
		Element authorEle = doc.select("#overview > dd.author").get(0);
		String author = authorEle.text();

		// changeset message
		Element msgEle = doc.select("#overview > dd.message").get(0);
		String message = msgEle.text();

		// changeset ticketid
		int ticketID = messageToTid(message);

		// changeset location 同时抽取文件信息
		Elements locationEles = doc.select("#overview > dt.location + dd > a");
		String location;
		if (locationEles.isEmpty()) { // 只有一个文件
			location = extractOnlyOneFile(doc, id);
		} else {
			String showLoc = locationEles.get(0).text();
			location = showLocToLoc(showLoc);
			String remainingLoc = remainingPath(showLoc, location);
			extractFiles(doc, remainingLoc, id);
		}

		// changeset version
		String version = locationToVersion(location, id);

		db.insertChangeset(id, author, ticketID, timestamp, message, location,
				version);
		System.out.println("Changeset " + id + " 完成");
	}

	private static String extractOnlyOneFile(Document doc, int id)
			throws SQLException {
		String file;
		Elements eles = doc.select("#overview > dd.files > ul > li > a");
		if (eles.isEmpty()) {
			return "";
		}
		String completeFile = eles.get(0).text();
		String location = showLocToLoc(completeFile);
		file = remainingPath(completeFile, location);

		Element typeEle = doc.select("#overview > dd.files > ul > li > div")
				.get(0);
		String type = typeEle.className();

		db.insertCommit(id, file, type);

		return location;
	}

	private static void extractFiles(Document doc, String prefix, int id)
			throws SQLException {
		Elements lis = doc.select("#overview > dd.files > ul > li");
		for (int i = 0; i < lis.size(); i++) {
			if (lis.get(i).text().equals("")) {
				continue;
			}
			String file = lis.get(i).getElementsByTag("a").get(0).text();
			String type = lis.get(i).getElementsByTag("div").get(0).className();
			if (!prefix.equals("")) {
				file = prefix + "/" + file;
			}
//			if (file.equals("debian-dev/sid/trac/log.py"))
//			if (file.equals("sandboxworkflow/trac/about.py"))
//			if (file.equals("sandboxbrowser-quickjump/trac/about.py"))
//				return;
			db.insertCommit(id, file, type);
		}
	}

	// 找出跟在最后面的数字
	private static int titleToID(String title) {
		Pattern p = Pattern.compile("\\d+");
		Matcher m = p.matcher(title);
		String str = null;
		if (m.find()) {
			str = m.group();
		}
		int id = Integer.valueOf(str);
		return id;
	}

	// 文本时间转换为Date
	private static Date elementToTime(String html) throws ParseException {
		Pattern p = Pattern
				.compile("\\D+ \\d\\d?, \\d\\d\\d\\d \\d\\d?:\\d\\d:\\d\\d \\DM");
		Matcher m = p.matcher(html);
		String str = null;
		if (m.find()) {
			str = m.group();
		}
		SimpleDateFormat sdf = new SimpleDateFormat("MMM d, yyyy h:mm:ss a",
				Locale.US);
		Date datetime = sdf.parse(str);
		return datetime;
	}

	// 从消息中提取ticketID
	private static int messageToTid(String message) {
		Pattern p1 = Pattern.compile("#\\d+");
		Matcher m1 = p1.matcher(message);
		int tid = 0;
		if (m1.find()) {
			String str = m1.group();
			tid = Integer.parseInt(str.split("#")[1]);
		}
		return tid;
	}

	static int[] firstTag = { 183, 314, 551, 1086, 2438, 3803, 7236, 9872,
			11307 };
	static String[] versions = { "0.5", "0.6", "0.7", "0.8", "0.9", "0.10",
			"0.11", "0.12", "1.0", "1.1" };

	private static String locationToVersion(String location, int cid) {
		String version = null;
		if (location.equals("trunk") || location.equals("")) {
			int tagNum = firstTag.length;
			if (cid <= firstTag[0]) {
				version = versions[0];
			} else if (cid > firstTag[tagNum - 1]) {
				version = versions[tagNum];
			} else {
				for (int i = 0; i < tagNum - 1; i++) {
					if (cid > firstTag[i] && cid <= firstTag[i + 1]) {
						version = versions[i + 1];
						break;
					}
				}
			}
		} else {
			Pattern p = Pattern.compile("\\d(.\\d)+");
			Matcher m = p.matcher(location);
			if (m.find()) {
				version = m.group();
			}
		}
		return version;
	}

	// 将显示的路径转化为路径
	private static String showLocToLoc(String showLoc) {
		Pattern p1 = Pattern
				.compile("(trunk)|((branches|tags)/[^/]*\\d.\\d+[^/]*/*)");
		Matcher m1 = p1.matcher(showLoc);
		Pattern p2 = Pattern.compile("branches|tags");
		Matcher m2 = p2.matcher(showLoc);
		String location;
		if (m1.find()) {
			location = m1.group();
			if (location.charAt(location.length()-1) == '/') {
				location = location.substring(0,location.length()-1);
			}
		} else if (m2.find()) {
			location = m2.group();
		} else {
			location = "";
		}
		return location;
	}
	
	private static String remainingPath (String path, String prefix) {
		String result;
		if (prefix.equals(path)) {
			result = "";
		} else {
			result = path.replaceFirst(prefix + "/", "");
		}
		return result;
	}
}
