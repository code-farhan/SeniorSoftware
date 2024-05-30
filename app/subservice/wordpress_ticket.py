import MySQLdb
import urllib2
import string
#import re

from sgmllib import SGMLParser

###comment classes
class getID(SGMLParser):
	def reset(self):
		self.ID = []
		self.flag = False
		self.getData = False
		SGMLParser.reset(self)

	def start_h1(self,attrs):
		self.flag = True
		return

	def end_h1(self):
		self.flag = False

	def start_a(self,attrs):
		if self.flag == False:
			return
		self.getData = True

	def end_a(self):
		if self.getData :
			self.getData = False

	def handle_data(self,text):
		if self.getData :
			self.ID = text.split(" ")

	def printID(self):
		print self.ID

class getComment(SGMLParser):
	def reset(self):
		self.CommentNum = []
		self.Author = []
		self.Content = "Contents: "
		self.Contents = []
		self.CommentTime = []
		self.flag=0
		self.CommentNumFlag = False
		self.AuthorOrTime = 2
		self.ContentFlag = False
		self.ContentData = False
		self.ContentEnd = False
		SGMLParser.reset(self)

	def start_span(self,attrs):
		for j,k in attrs :
			if j == 'class' and k == 'threading' :
				self.flag = 3
			if j == 'class' and k == 'cnum' and self.flag == 3 :
				self.CommentNumFlag = True
			if j == 'class' and k == 'avatar' and self.flag == 1 :
				self.ContentFlag = True
				self.AuthorOrTime = 2
				return

	def end_span(self):
		if self.flag != 0 :
			self.flag -= 1

        ##commentNum  Author  commentTime
	def start_a(self,attrs):
		if self.flag == 3 :
			cnum = [v for k, v in attrs if k == "href"]
			self.CommentNum.extend(cnum)
		if self.flag == 1 and self.AuthorOrTime == 2 :
			author = [v for k, v in attrs if k == "href"]
			au = author[0][30:]
			self.Author.append(au)
		if self.flag == 1 and self.AuthorOrTime == 1 :		
			ctime = [v for k, v in attrs if k == "title"]
			ct = ctime[0][:-13]
			self.CommentTime.append(ct)
		if self.flag == 0 and self.ContentFlag == True :
			self.ContentData = True
	
	def end_a(self):
		if self.AuthorOrTime != 0 :
			self.AuthorOrTime -= 1

	##Content
	def start_div(self,attrs):
		for k , v in attrs :
			if k =='class' and v == 'comment searchable' :
				self.ContentFlag = True
			
	def end_div(self):
		if self.ContentData == True :
			self.ContentFlag = False
			self.ContentData = False
			self.ContentEnd = True
	
	

			
	##

	def handle_data(self, text):		
		if self.ContentData == True:
			self.Content += text
		if self.ContentEnd == True :
			self.Contents.append(self.Content)
			self.ContentEnd = False
			self.Content = "Contents: "

	def printComment(self):
		print self.CommentNum[0]
		print self.Author
		print self.CommentTime
		print len(self.Contents)


# ###
# conn = MySQLdb.connect(host='localhost',user='root',db='wordpress',passwd='')
# cursor = conn.cursor()

# ###ScrawlInfo
originURL = "https://core.trac.wordpress.org/ticket/"
for o in range(12348,13050) : 
	URL = originURL+str(o)	
	content = urllib2.urlopen(URL).read()


	putID = getID()
	putID.feed(content)
	putID.printID()

	putComment = getComment()
	putComment.feed(content)
	putComment.printComment()

# 	for i in range(0,len(putComment.CommentNum)):
# 		value = [putID.ID[1],putComment.CommentNum[i],putComment.Author[i]," to be continued ",putComment.CommentTime[i]]
# 		cursor.execute("insert into comment(ticketID,commentNum,author,content,commentTime) values(%s,%s,%s,%s,%s)",value)


# 	cursor.execute('select * from comment');
# 	print 'result'
# 	cursor.scroll(0,mode='absolute')
# 	results=cursor.fetchall()
# 	for r in results:
# 		print r
# 	conn.commit()
# ####
# cursor.close()
# conn.close()













