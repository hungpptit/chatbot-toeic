USE [master]
GO
/****** Object:  Database [ChatbotToeic]    Script Date: 7/24/2025 12:31:19 AM ******/
CREATE DATABASE [ChatbotToeic]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'ChatbotToeic', FILENAME = N'D:\sql_sever\MSSQL16.SQLEXPRESS\MSSQL\DATA\ChatbotToeic.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'ChatbotToeic_log', FILENAME = N'D:\sql_sever\MSSQL16.SQLEXPRESS\MSSQL\DATA\ChatbotToeic_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [ChatbotToeic] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [ChatbotToeic].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [ChatbotToeic] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [ChatbotToeic] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [ChatbotToeic] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [ChatbotToeic] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [ChatbotToeic] SET ARITHABORT OFF 
GO
ALTER DATABASE [ChatbotToeic] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [ChatbotToeic] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [ChatbotToeic] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [ChatbotToeic] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [ChatbotToeic] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [ChatbotToeic] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [ChatbotToeic] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [ChatbotToeic] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [ChatbotToeic] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [ChatbotToeic] SET  ENABLE_BROKER 
GO
ALTER DATABASE [ChatbotToeic] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [ChatbotToeic] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [ChatbotToeic] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [ChatbotToeic] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [ChatbotToeic] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [ChatbotToeic] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [ChatbotToeic] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [ChatbotToeic] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [ChatbotToeic] SET  MULTI_USER 
GO
ALTER DATABASE [ChatbotToeic] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [ChatbotToeic] SET DB_CHAINING OFF 
GO
ALTER DATABASE [ChatbotToeic] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [ChatbotToeic] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [ChatbotToeic] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [ChatbotToeic] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [ChatbotToeic] SET QUERY_STORE = ON
GO
ALTER DATABASE [ChatbotToeic] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [ChatbotToeic]
GO
/****** Object:  Table [dbo].[Tests]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[duration] [nvarchar](50) NULL,
	[participants] [int] NULL,
	[comments] [int] NULL,
	[questions] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserTests]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserTests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[testId] [int] NOT NULL,
	[score] [float] NULL,
	[startedAt] [datetimeoffset](7) NULL,
	[completedAt] [datetimeoffset](7) NULL,
	[status] [varchar](20) NULL,
 CONSTRAINT [PK__UserTest__3213E83F53859222] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[View_Tests_WithParticipants]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [dbo].[View_Tests_WithParticipants] AS
SELECT 
    T.id,
    T.title,
    T.duration,
    T.comments,
    T.questions,
    COUNT(UT.id) AS participants
FROM Tests T
LEFT JOIN UserTests UT ON T.id = UT.testId
GROUP BY 
    T.id, T.title, T.duration, T.comments, T.questions;
GO
/****** Object:  Table [dbo].[Antonyms]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Antonyms](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[vocabId] [int] NOT NULL,
	[antonym] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Conversations]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Conversations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[title] [nvarchar](255) NULL,
	[createdAt] [datetimeoffset](7) NULL,
	[updatedAt] [datetimeoffset](7) NULL,
	[deletedAt] [datetimeoffset](7) NULL,
 CONSTRAINT [PK__Conversa__3213E83F8FB5CA13] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Courses]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Courses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Logs]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Logs](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NULL,
	[message] [nvarchar](max) NULL,
	[response] [nvarchar](max) NULL,
	[timestamp] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Meanings]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Meanings](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[vocabId] [int] NOT NULL,
	[partOfSpeech] [nvarchar](30) NULL,
	[definition] [nvarchar](max) NOT NULL,
	[example] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Messages]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Messages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[conversationId] [int] NOT NULL,
	[role] [nvarchar](10) NULL,
	[content] [nvarchar](max) NOT NULL,
	[createdAt] [datetimeoffset](7) NULL,
	[updatedAt] [datetimeoffset](7) NULL,
 CONSTRAINT [PK__Messages__3213E83F7BA275BA] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Part]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Part](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Pronunciations]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Pronunciations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[vocabId] [int] NOT NULL,
	[accent] [varchar](10) NULL,
	[phoneticText] [nvarchar](100) NULL,
	[audioUrl] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Questions]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Questions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[question] [nvarchar](max) NULL,
	[optionA] [nvarchar](max) NULL,
	[optionB] [nvarchar](max) NULL,
	[optionC] [nvarchar](max) NULL,
	[optionD] [nvarchar](max) NULL,
	[correctAnswer] [char](1) NULL,
	[explanation] [nvarchar](max) NULL,
	[typeId] [int] NULL,
	[partId] [int] NULL,
 CONSTRAINT [PK__Question__3213E83FF855941F] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QuestionType]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QuestionType](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](50) NOT NULL,
	[description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Synonyms]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Synonyms](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[vocabId] [int] NOT NULL,
	[synonym] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Test_Courses]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Test_Courses](
	[testId] [int] NOT NULL,
	[courseId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[testId] ASC,
	[courseId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TestQuestions]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TestQuestions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[testId] [int] NOT NULL,
	[questionId] [int] NOT NULL,
	[sortOrder] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserResults]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserResults](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NULL,
	[questionId] [int] NULL,
	[isCorrect] [bit] NULL,
	[answeredAt] [datetimeoffset](7) NULL,
	[selectedOption] [varchar](10) NULL,
	[userTestId] [int] NULL,
 CONSTRAINT [PK__UserResu__3213E83F9923A3B2] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](100) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
	[role_id] [int] NULL,
	[avatar] [nvarchar](255) NULL,
	[status] [bit] NOT NULL,
 CONSTRAINT [PK__Users__3213E83F157F6D56] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserVocabulary]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserVocabulary](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NULL,
	[vocabId] [int] NULL,
	[reviewCount] [int] NULL,
	[lastReviewed] [datetime] NULL,
	[isMastered] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vocabulary]    Script Date: 7/24/2025 12:31:20 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vocabulary](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[word] [nvarchar](100) NOT NULL,
	[definition] [nvarchar](max) NULL,
	[example] [nvarchar](max) NULL,
	[topic] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Antonyms] ON 

INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (26, 13, N'dislike')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (27, 13, N'pet hate')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (28, 13, N'pet peeve')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (29, 13, N'hate')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (30, 13, N'mislike')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (31, 13, N'unlike')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (32, 13, N'antithesis')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (33, 13, N'opposite')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (34, 14, N'careless')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (35, 14, N'sloppy')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (36, 14, N'negligent')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (37, 15, N'goodbye')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (38, 15, N'farewell')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (39, 15, N'adieu')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (40, 16, N'goodbye')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (41, 16, N'farewell')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (42, 16, N'adieu')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (43, 17, N'away')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (44, 17, N'road')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (45, 17, N'visitor')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (46, 18, N'dilute')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (47, 19, N'horrible')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (48, 19, N'horrid')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (49, 19, N'nasty')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (50, 19, N'awful')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (51, 19, N'disgusting')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (52, 19, N'distasteful')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (53, 19, N'foul')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (54, 19, N'gross')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (55, 19, N'nauseating')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (56, 19, N'putrid')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (57, 19, N'rancid')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (58, 19, N'rank')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (59, 19, N'sickening')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (60, 19, N'unsatisfactory')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (61, 19, N'naughty')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (62, 20, N'extinguish')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (63, 20, N'put out')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (64, 20, N'quench')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (65, 20, N'forceful')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (66, 20, N'heavy')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (67, 20, N'strong')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (68, 20, N'crucial')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (69, 20, N'important')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (70, 20, N'weighty')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (71, 20, N'cumbersome')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (72, 20, N'heavyweight')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (73, 20, N'massive')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (74, 20, N'calorific')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (75, 20, N'fatty')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (76, 20, N'burdensome')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (77, 24, N'fragile')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (78, 24, N'weak')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (79, 24, N'delicate')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (80, 25, N'rest')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (81, 25, N'leisure')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (82, 25, N'idleness')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (83, 27, N'indecision')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (84, 27, N'hesitation')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (85, 27, N'uncertainty')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (86, 29, N'secret')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (87, 29, N'silence')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (88, 29, N'concealment')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (89, 30, N'hesitate')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (90, 30, N'waver')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (91, 30, N'doubt')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (92, 31, N'bare')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (93, 31, N'exposed')
INSERT [dbo].[Antonyms] ([id], [vocabId], [antonym]) VALUES (94, 31, N'uncovered')
SET IDENTITY_INSERT [dbo].[Antonyms] OFF
GO
SET IDENTITY_INSERT [dbo].[Conversations] ON 

INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (28, 6, N'Học Toeic', CAST(N'2025-07-16T12:13:10.7080000+00:00' AS DateTimeOffset), CAST(N'2025-07-16T12:13:10.7090000+00:00' AS DateTimeOffset), NULL)
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (29, 3, N'admin chat', CAST(N'2025-07-17T13:09:06.9190000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:09:06.9210000+00:00' AS DateTimeOffset), NULL)
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (30, 3, N'đây là tên test thử độ dài coi ', CAST(N'2025-07-21T04:35:00.5610000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:36:32.9100000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:38:33.3680000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (31, 3, N'1', CAST(N'2025-07-21T04:36:40.8230000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:36:40.8230000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:38:29.2640000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (32, 3, N'test mới xem', CAST(N'2025-07-21T04:38:08.4600000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:38:08.4600000+00:00' AS DateTimeOffset), NULL)
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (33, 3, N'test nt dc ko', CAST(N'2025-07-21T04:40:47.1820000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:40:47.1830000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:45:05.7160000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (34, 3, N'hung', CAST(N'2025-07-21T04:41:38.6060000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:41:38.6070000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:45:02.1250000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (35, 3, N'hung', CAST(N'2025-07-21T04:45:10.6610000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:45:10.6640000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:49:09.4980000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (36, 3, N'hung1', CAST(N'2025-07-21T04:46:45.7810000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:46:45.7820000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:49:06.8940000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (37, 3, N'test lại', CAST(N'2025-07-21T04:49:12.5570000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:49:12.5570000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:49:35.5640000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (38, 3, N'hi', CAST(N'2025-07-21T04:49:40.0710000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:49:40.0720000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:52:18.1600000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (39, 3, N'hello', CAST(N'2025-07-21T04:50:49.5370000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:50:49.5370000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:52:15.4950000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (40, 3, N'hi', CAST(N'2025-07-21T04:52:20.5520000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:52:20.5520000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:55:41.4770000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (41, 3, N'test', CAST(N'2025-07-21T04:55:44.7890000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:55:44.7900000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:57:07.4570000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (42, 3, N'hii', CAST(N'2025-07-21T04:57:11.1300000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:57:11.1300000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:58:50.9600000+00:00' AS DateTimeOffset))
INSERT [dbo].[Conversations] ([id], [userId], [title], [createdAt], [updatedAt], [deletedAt]) VALUES (43, 3, N'hello', CAST(N'2025-07-21T04:58:43.6380000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:58:43.6380000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:58:53.4540000+00:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[Conversations] OFF
GO
SET IDENTITY_INSERT [dbo].[Courses] ON 

INSERT [dbo].[Courses] ([id], [name]) VALUES (20, N'ACT')
INSERT [dbo].[Courses] ([id], [name]) VALUES (11, N'Digital SAT')
INSERT [dbo].[Courses] ([id], [name]) VALUES (17, N'Hóa học THPTQG')
INSERT [dbo].[Courses] ([id], [name]) VALUES (5, N'HSK 1')
INSERT [dbo].[Courses] ([id], [name]) VALUES (6, N'HSK 2')
INSERT [dbo].[Courses] ([id], [name]) VALUES (7, N'HSK 3')
INSERT [dbo].[Courses] ([id], [name]) VALUES (8, N'HSK 4')
INSERT [dbo].[Courses] ([id], [name]) VALUES (9, N'HSK 5')
INSERT [dbo].[Courses] ([id], [name]) VALUES (10, N'HSK 6')
INSERT [dbo].[Courses] ([id], [name]) VALUES (2, N'IELTS Academic')
INSERT [dbo].[Courses] ([id], [name]) VALUES (3, N'IELTS General')
INSERT [dbo].[Courses] ([id], [name]) VALUES (19, N'SAT')
INSERT [dbo].[Courses] ([id], [name]) VALUES (16, N'Sinh học THPTQG')
INSERT [dbo].[Courses] ([id], [name]) VALUES (14, N'Tiếng Anh THPTQG')
INSERT [dbo].[Courses] ([id], [name]) VALUES (15, N'Toán THPTQG')
INSERT [dbo].[Courses] ([id], [name]) VALUES (4, N'TOEIC')
INSERT [dbo].[Courses] ([id], [name]) VALUES (1, N'TOFEL')
INSERT [dbo].[Courses] ([id], [name]) VALUES (13, N'TOPIK I')
INSERT [dbo].[Courses] ([id], [name]) VALUES (12, N'TOPIK II')
SET IDENTITY_INSERT [dbo].[Courses] OFF
GO
SET IDENTITY_INSERT [dbo].[Meanings] ON 

INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (1, 13, N'noun', N'(usually in the plural) Something that a person likes (prefers).', N'Tell me your likes and dislikes.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (2, 13, N'noun', N'An individual vote showing support for, or approval of, something posted on the Internet.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (3, 13, N'verb', N'To enjoy, be pleased by; favor; be in favor of.', N'I like hamburgers.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (4, 13, N'verb', N'To please.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (5, 13, N'verb', N'To derive pleasure of, by or with someone or something.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (6, 13, N'verb', N'To prefer and maintain (an action) as a regular habit or activity.', N'I like to go to the dentist every six months.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (7, 13, N'verb', N'To have an appearance or expression; to look; to seem to be (in a specified condition).', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (8, 13, N'verb', N'To come near; to avoid with difficulty; to escape narrowly.', N'He liked to have been too late.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (9, 13, N'verb', N'To find attractive; to prefer the company of; to have mild romantic feelings for.', N'I really like Sandra but don''t know how to tell her.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (10, 13, N'verb', N'To liken; to compare.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (11, 13, N'verb', N'To show support for, or approval of, something posted on the Internet by marking it with a vote.', N'I can''t stand Bloggs'' tomato ketchup, but I liked it on Facebook so I could enter a competition.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (12, 13, N'verb', N'(with ''would'' and in certain other phrases) To want, desire. See also would like.', N'We could go to the museum if you like.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (13, 13, N'noun', N'(sometimes as the likes of'') Someone similar to a given person, or something similar to a given object; a comparative; a type; a sort.', N'It was something the likes of which I had never seen before.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (14, 13, N'noun', N'The stroke that equalizes the number of strokes played by the opposing player or side.', N'to play the like')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (15, 13, N'adjective', N'Similar.', N'My partner and I have like minds.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (16, 13, N'adjective', N'Likely; probable.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (17, 13, N'adverb', N'Likely.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (18, 13, N'adverb', N'In a like or similar manner.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (19, 13, N'preposition', N'Similar to, reminiscent of.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (20, 13, N'preposition', N'Typical of', N'It would be just like Achilles to be sulking in his tent.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (21, 13, N'preposition', N'Approximating', N'Popcorn costs something like $10 dollars at the movies.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (22, 13, N'preposition', N'In the manner of, similarly to.', N'He doesn''t act like a president.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (23, 13, N'preposition', N'Such as', N'It''s for websites like Wikipedia.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (24, 13, N'preposition', N'As if there would be.', N'It looks like a hot summer in Europe.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (25, 13, N'conjunction', N'As, the way.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (26, 13, N'conjunction', N'As if; as though.', N'It looks like you''ve finished the project.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (27, 13, N'interjection', N'Used to place emphasis upon a statement.', N'Divint ye knaa, like?')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (28, 13, N'verb', N'To be likely.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (29, 17, N'noun', N'A dwelling.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (30, 17, N'noun', N'One’s native land; the place or country in which one dwells; the place where one’s ancestors dwell or dwelt.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (31, 17, N'noun', N'The locality where a thing is usually found, or was first found, or where it is naturally abundant; habitat; seat.', N'the home of the pine')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (32, 17, N'noun', N'A focus point.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (33, 17, N'verb', N'(of animals) To return to its owner.', N'The dog homed.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (34, 17, N'verb', N'(always with "in on") To seek or aim for something.', N'The missile was able to home in on the target.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (35, 17, N'adjective', N'Of or pertaining to one’s dwelling or country; domestic; not foreign; as home manufactures; home comforts.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (36, 17, N'adjective', N'(except in phrases) That strikes home; direct, pointed.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (37, 17, N'adjective', N'Personal, intimate.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (38, 17, N'adjective', N'Relating to the home team (the team at whose venue a game is played).', N'the home end, home advantage, home supporters')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (39, 17, N'adverb', N'To one''s home', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (40, 17, N'adverb', N'At or in one''s place of residence or one''s customary or official location; at home', N'Everyone''s gone to watch the game; there''s nobody home.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (41, 17, N'adverb', N'To a full and intimate degree; to the heart of the matter; fully, directly.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (42, 17, N'adverb', N'Into the goal', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (43, 17, N'adverb', N'Into the right, proper or stowed position', N'sails sheeted home')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (44, 17, N'noun', N'A directory that contains a user''s files.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (45, 18, N'noun', N'A substance that is in a condensed form.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (46, 18, N'verb', N'To bring to, or direct toward, a common center; to unite more closely; to gather into one body, mass, or force.', N'to concentrate rays of light into a focus')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (47, 18, N'verb', N'To increase the strength and diminish the bulk of, as of a liquid or an ore; to intensify, by getting rid of useless material; to condense.', N'to concentrate acid by evaporation')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (48, 18, N'verb', N'To approach or meet in a common center; to consolidate.', N'Population tends to concentrate in cities.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (49, 18, N'verb', N'To focus one''s thought or attention (on).', N'Let me concentrate!')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (50, 19, N'noun', N'Niceness.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (51, 19, N'adjective', N'Pleasant, satisfactory.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (52, 19, N'adjective', N'Of a person: friendly, attractive.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (53, 19, N'adjective', N'Respectable; virtuous.', N'What is a nice person like you doing in a place like this?')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (54, 19, N'adjective', N'(with and) Shows that the given adjective is desirable, or acts as a mild intensifier; pleasantly, quite.', N'The soup is nice and hot.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (55, 19, N'adjective', N'Silly, ignorant; foolish.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (56, 19, N'adjective', N'Particular in one''s conduct; scrupulous, painstaking; choosy.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (57, 19, N'adjective', N'Particular as regards rules or qualities; strict.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (58, 19, N'adjective', N'Showing or requiring great precision or sensitive discernment; subtle.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (59, 19, N'adjective', N'Easily injured; delicate; dainty.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (60, 19, N'adjective', N'Doubtful, as to the outcome; risky.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (61, 19, N'adverb', N'Nicely.', N'Children, play nice.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (62, 19, N'interjection', N'Used to signify a job well done.', N'Nice! I couldn''t have done better.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (63, 19, N'interjection', N'Used to signify approval.', N'Is that your new car? Nice!')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (64, 19, N'verb', N'To run a process with a specified (usually lower) priority.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (65, 20, N'noun', N'Visible electromagnetic radiation. The human eye can typically detect radiation (light) in the wavelength range of about 400 to 750 nanometers. Nearby shorter and longer wavelength ranges, although not visible, are commonly called ultraviolet and infrared light.', N'As you can see, this spacious dining-room gets a lot of light in the mornings.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (66, 20, N'noun', N'A source of illumination.', N'Put that light out!')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (67, 20, N'noun', N'Spiritual or mental illumination; enlightenment, useful information.', N'Can you throw any light on this problem?')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (68, 20, N'noun', N'(in the plural) Facts; pieces of information; ideas, concepts.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (69, 20, N'noun', N'A notable person within a specific field or discipline.', N'Picasso was one of the leading lights of the cubist movement.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (70, 20, N'noun', N'The manner in which the light strikes a picture; that part of a picture which represents those objects upon which the light is supposed to fall; the more illuminated part of a landscape or other scene; opposed to shade.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (71, 20, N'noun', N'A point of view, or aspect from which a concept, person or thing is regarded.', N'I''m really seeing you in a different light today.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (72, 20, N'noun', N'A flame or something used to create fire.', N'Hey, buddy, you got a light?')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (73, 20, N'noun', N'A firework made by filling a case with a substance which burns brilliantly with a white or coloured flame.', N'a Bengal light')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (74, 20, N'noun', N'A window, or space for a window in architecture.', N'This facade has eight south-facing lights.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (75, 20, N'noun', N'The series of squares reserved for the answer to a crossword clue.', N'The average length of a light on a 15×15 grid is 7 or 8.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (76, 20, N'noun', N'A cross-light in a double acrostic or triple acrostic.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (77, 20, N'noun', N'Open view; a visible state or condition; public observation; publicity.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (78, 20, N'noun', N'The power of perception by vision.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (79, 20, N'noun', N'The brightness of the eye or eyes.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (80, 20, N'noun', N'A traffic light, or, by extension, an intersection controlled by one or more that will face a traveler who is receiving instructions.', N'To get to our house, turn right at the third light.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (81, 20, N'verb', N'To start (a fire).', N'We lit the fire to get some heat.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (82, 20, N'verb', N'To set fire to; to set burning.', N'She lit her last match.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (83, 20, N'verb', N'To illuminate; to provide light for when it is dark.', N'I used my torch to light the way home through the woods in the night.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (84, 20, N'verb', N'To become ignited; to take fire.', N'This soggy match will not light.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (85, 20, N'verb', N'To attend or conduct with a light; to show the way to by means of a light.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (86, 20, N'verb', N'To make (a bonus) available to be collected by hitting a target, and thus light up the feature light corresponding to that bonus to indicate its availability.', N'Light the extra ball by amassing 500 million points in the wizard mode.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (87, 20, N'adjective', N'Having light; bright; clear; not dark or obscure.', N'The room is light when the Sun shines through the window.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (88, 20, N'adjective', N'Pale or whitish in color; highly luminous and more or less deficient in chroma.', N'She had light skin.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (89, 20, N'adjective', N'(of coffee) Served with extra milk or cream.', N'I like my coffee light.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (90, 20, N'noun', N'A stone that is not thrown hard enough.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (91, 20, N'noun', N'See lights.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (92, 20, N'verb', N'To unload a ship, or to jettison material to make it lighter', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (93, 20, N'verb', N'To lighten; to ease of a burden; to take off.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (94, 20, N'adjective', N'Having little or relatively little actual weight; not cumbrous or unwieldy.', N'a light load ; a lighter backpack after having removed the books ; light weapons')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (95, 20, N'adjective', N'Having little weight as compared with bulk; of little density or specific gravity.', N'feathers and cork are light ; oil is lighter than water')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (96, 20, N'adjective', N'Of short or insufficient weight; weighing less than the legal, standard or proper amount; clipped or diminished.', N'to issue light coin')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (97, 20, N'adjective', N'Lacking that which burdens or makes heavy.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (98, 20, N'adjective', N'Not heavy or soggy; spongy; well raised.', N'a light bread ; sponge cake is a light cake')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (99, 20, N'adjective', N'Gentle; having little force or momentum.', N'This artist clearly had a light, flowing touch.')
GO
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (100, 20, N'adjective', N'Easy to endure or perform.', N'light duties around the house')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (101, 20, N'adjective', N'Low in fat, calories, alcohol, salt, etc.', N'This light beer still gets you drunk if you have enough of it.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (102, 20, N'adjective', N'Unimportant, trivial, having little value or significance.', N'I made some light comment, and we moved on.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (103, 20, N'adjective', N'Unchaste, wanton.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (104, 20, N'adjective', N'Not encumbered; unembarrassed; clear of impediments; hence, active; nimble; swift.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (105, 20, N'adjective', N'Easily influenced by trifling considerations; unsteady; unsettled; volatile.', N'a light, vain person; a light mind')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (106, 20, N'adjective', N'Indulging in, or inclined to, levity; lacking dignity or solemnity; frivolous; airy.', N'Ogden Nash was a writer of light verse.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (107, 20, N'adjective', N'Not quite sound or normal; somewhat impaired or deranged; dizzy; giddy.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (108, 20, N'adjective', N'Easily interrupted by stimulation.', N'light sleep; light anesthesia')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (109, 20, N'adverb', N'Carrying little.', N'I prefer to travel light.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (110, 20, N'verb', N'To find by chance.', N'I lit upon a rare book in a second-hand bookseller''s.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (111, 20, N'verb', N'To stop upon (of eyes or a glance); to notice', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (112, 20, N'verb', N'To alight; to land or come down.', N'She fell out of the window but luckily lit on her feet.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (113, 21, N'noun', N'A cluster of heterogeneous things.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (114, 21, N'noun', N'A corporation formed by the combination of several smaller corporations whose activities are unrelated to the corporation''s primary activity.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (115, 21, N'noun', N'A rock consisting of gravel or pebbles embedded in a matrix.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (116, 21, N'verb', N'To combine together into a larger mass.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (117, 21, N'verb', N'To combine together into a larger corporation.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (118, 21, N'adjective', N'Clustered together into a mass.', N'conglomerate flowers')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (119, 21, N'adjective', N'Composed of fragments of rock, pebbles, or stones cemented together.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (120, 22, N'noun', N'A specimen of the now extinct species Homo neanderthalensis.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (121, 22, N'noun', N'A primitive person.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (122, 22, N'adjective', N'Of or pertaining to Homo neanderthalensis.', N'The capacity of the Neanderthal skull was 10% larger than that of modern humans.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (123, 22, N'adjective', N'Old-fashioned, opposed to change (in allusion to Homo neanderthalensis).', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (124, 22, N'adjective', N'Of or pertaining to the Neander Valley in Germany.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (125, 23, N'noun', N'A package wrapped for shipment.', N'I saw a brown paper parcel on my doorstep.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (126, 23, N'noun', N'An individual consignment of cargo for shipment, regardless of size and form.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (127, 23, N'noun', N'A division of land bought and sold as a unit.', N'I own a small parcel of land between the refinery and the fish cannery.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (128, 23, N'noun', N'A group of birds.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (129, 23, N'noun', N'An indiscriminate or indefinite number, measure, or quantity; a collection; a group.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (130, 23, N'noun', N'A small amount of food that has been wrapped up, for example a pastry.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (131, 23, N'noun', N'A portion of anything taken separately; a fragment of a whole; a part.', N'A certain piece of land is part and parcel of another piece.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (132, 23, N'verb', N'To wrap something up into the form of a package.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (133, 23, N'verb', N'To wrap a strip around the end of a rope.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (134, 23, N'verb', N'To divide and distribute by parts or portions; often with out or into.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (135, 23, N'verb', N'To add a parcel or item to; to itemize.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (136, 23, N'adverb', N'Part or half; in part; partially.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (137, 26, N'noun', N'In a right triangle, the reciprocal of the sine of an angle. Symbols: cosec, csc', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (138, 28, N'noun', N'An item of clothing other than a mitten, covering all or part of the hand and fingers, but usually allowing independent movement of the fingers.', N'I wore gloves to keep my hands warm.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (139, 28, N'noun', N'A baseball mitt.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (140, 28, N'noun', N'The ability to catch a hit ball.', N'Frederico had a great glove, but he couldn''t hit a curveball, so he never broke into the pros.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (141, 28, N'noun', N'A condom.', NULL)
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (142, 28, N'noun', N'(with definite article) A challenge from one to another.', N'to throw down the glove, i.e. to offer a challenge; to take up the glove, to accept it')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (143, 28, N'verb', N'To catch the ball in a baseball mitt.', N'He gloved the line drive for the third out.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (144, 28, N'verb', N'To put a glove or gloves on.', N'Maxwell gloved his hand so that he wouldn''t leave fingerprints, then pulled the trigger.')
INSERT [dbo].[Meanings] ([id], [vocabId], [partOfSpeech], [definition], [example]) VALUES (145, 28, N'verb', N'To touch a delivery with one''s glove while the gloved hand is on the bat. Under the rules of cricket, the batsman is deemed to have hit the ball.', NULL)
SET IDENTITY_INSERT [dbo].[Meanings] OFF
GO
SET IDENTITY_INSERT [dbo].[Messages] ON 

INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (74, 28, N'user', N'chào bạn', CAST(N'2025-07-16T12:14:01.9120000+00:00' AS DateTimeOffset), CAST(N'2025-07-16T12:14:01.9140000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (75, 28, N'model', N'💬 Trả lời: Chào bạn.', CAST(N'2025-07-16T12:14:03.7710000+00:00' AS DateTimeOffset), CAST(N'2025-07-16T12:14:03.7710000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (76, 29, N'user', N'chào bạn', CAST(N'2025-07-17T13:09:15.7760000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:09:15.7770000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (77, 29, N'model', N'💬 Trả lời: Chào bạn.', CAST(N'2025-07-17T13:09:18.4510000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:09:18.4520000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (78, 29, N'user', N'tôi là admin của trang web này á, người tạo ra trang web này ', CAST(N'2025-07-17T13:09:36.9660000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:09:36.9660000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (79, 29, N'model', N'💬 Trả lời: Chào admin! Rất vui được gặp bạn.', CAST(N'2025-07-17T13:09:38.8610000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:09:38.8610000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (80, 29, N'user', N'tôi tên phạm tuấn hưng', CAST(N'2025-07-17T13:10:43.6410000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:10:43.6420000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (81, 29, N'model', N'💬 Trả lời: Chào anh Phạm Tuấn Hưng.', CAST(N'2025-07-17T13:10:45.4410000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:10:45.4410000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (82, 29, N'user', N'bạn biết tôi là ai không', CAST(N'2025-07-17T13:10:54.2140000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:10:54.2140000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (83, 29, N'model', N'💬 Trả lời: 💬 Trả lời: Tôi biết anh là Phạm Tuấn Hưng, admin của trang web này.', CAST(N'2025-07-17T13:10:55.9820000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:10:55.9820000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (84, 29, N'user', N'sao bạn lại có 2 chữ 💬 Trả lời:', CAST(N'2025-07-17T13:11:13.4700000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:11:13.4710000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (85, 29, N'model', N'💬 Trả lời: Do lỗi kỹ thuật trong quá trình tạo phản hồi. Xin lỗi vì sự bất tiện này.', CAST(N'2025-07-17T13:11:15.3710000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:11:15.3710000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (86, 29, N'user', N'bạn có đọc được kí tự đặc biệt của tôi ko? ví dụ như icon này  💬 ', CAST(N'2025-07-17T13:11:43.3610000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:11:43.3620000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (87, 29, N'model', N'💬 Trả lời: Có, tôi đọc được ký tự đặc biệt đó.', CAST(N'2025-07-17T13:11:45.1790000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:11:45.1790000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (88, 29, N'user', N'đó là icon gì ', CAST(N'2025-07-17T13:11:52.1690000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:11:52.1700000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (89, 29, N'model', N'💬 Trả lời: 💬 Trả lời: Icon tin nhắn/hộp thoại.', CAST(N'2025-07-17T13:11:54.0100000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:11:54.0100000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (90, 29, N'user', N'tôi gửi ảnh cho bạn được không', CAST(N'2025-07-17T13:12:02.7910000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:12:02.7920000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (91, 29, N'model', N'💬 Trả lời: 💬 Trả lời: Hiện tại tôi không thể nhận ảnh trực tiếp.', CAST(N'2025-07-17T13:12:04.6550000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:12:04.6550000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (92, 29, N'user', N'bạn lại ra 2 chữ trả lời rồi', CAST(N'2025-07-17T13:12:17.3680000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:12:17.3680000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (93, 29, N'model', N'💬 Trả lời: 💬 Trả lời: Tôi hiểu. Tôi sẽ cố gắng khắc phục.', CAST(N'2025-07-17T13:12:19.2360000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T13:12:19.2360000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (94, 33, N'user', N'hi', CAST(N'2025-07-21T04:41:29.2150000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:41:29.2160000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (95, 33, N'model', N'💬 Trả lời: Chào bạn!', CAST(N'2025-07-21T04:41:31.0940000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:41:31.0940000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (96, 36, N'user', N'hi', CAST(N'2025-07-21T04:47:11.8690000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:47:11.8690000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (97, 36, N'model', N'💬 Trả lời: Chào bạn.', CAST(N'2025-07-21T04:47:14.5550000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:47:14.5550000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (98, 42, N'user', N'chào bạn', CAST(N'2025-07-21T04:57:16.3790000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:57:16.3790000+00:00' AS DateTimeOffset))
INSERT [dbo].[Messages] ([id], [conversationId], [role], [content], [createdAt], [updatedAt]) VALUES (99, 42, N'model', N'💬 Trả lời: Chào bạn.', CAST(N'2025-07-21T04:57:18.1070000+00:00' AS DateTimeOffset), CAST(N'2025-07-21T04:57:18.1070000+00:00' AS DateTimeOffset))
SET IDENTITY_INSERT [dbo].[Messages] OFF
GO
SET IDENTITY_INSERT [dbo].[Part] ON 

INSERT [dbo].[Part] ([id], [name]) VALUES (1, N'Part 1')
INSERT [dbo].[Part] ([id], [name]) VALUES (2, N'Part 2')
INSERT [dbo].[Part] ([id], [name]) VALUES (3, N'Part 3')
INSERT [dbo].[Part] ([id], [name]) VALUES (4, N'Part 4')
INSERT [dbo].[Part] ([id], [name]) VALUES (5, N'Part 5')
INSERT [dbo].[Part] ([id], [name]) VALUES (6, N'Part 6')
INSERT [dbo].[Part] ([id], [name]) VALUES (7, N'Part 7')
INSERT [dbo].[Part] ([id], [name]) VALUES (8, N'Part 8')
INSERT [dbo].[Part] ([id], [name]) VALUES (9, N'Part 9')
INSERT [dbo].[Part] ([id], [name]) VALUES (10, N'Part 10')
SET IDENTITY_INSERT [dbo].[Part] OFF
GO
SET IDENTITY_INSERT [dbo].[Pronunciations] ON 

INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (20, 13, N'US', N'/laɪk/', N'https://api.dictionaryapi.dev/media/pronunciations/en/like-us.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (21, 17, N'Other', N'/(h)əʊm/', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (22, 17, N'US', N'/hoʊm/', N'https://api.dictionaryapi.dev/media/pronunciations/en/home-us.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (23, 18, N'Other', N'/ˈkɒn.sən.tɹeɪt/', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (24, 18, N'Other', N'/ˈkɑn.sən.tɹeɪt/', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (25, 19, N'US', N'/naɪs/', N'https://api.dictionaryapi.dev/media/pronunciations/en/nice-us.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (26, 20, N'Other', N'/lʌɪt/', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (27, 20, N'UK', N'/laɪt/', N'https://api.dictionaryapi.dev/media/pronunciations/en/light-uk.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (28, 20, N'US', N'[ɫɐɪ̯ʔ]', N'https://api.dictionaryapi.dev/media/pronunciations/en/light-us.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (29, 21, N'AU', NULL, N'https://api.dictionaryapi.dev/media/pronunciations/en/conglomerate-au.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (30, 21, N'UK', N'/kənˈɡlɒm(ə)ɹət/', N'https://api.dictionaryapi.dev/media/pronunciations/en/conglomerate-uk.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (31, 21, N'Other', N'/kənˈɡlɑm(ə)ɹət/', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (32, 23, N'Other', N'[ˈpʰaː.səɫ]', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (33, 23, N'Other', N'[ˈpʰɑː.səɫ]', NULL)
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (34, 23, N'US', N'[ˈpʰɑɹ.səɫ]', N'https://api.dictionaryapi.dev/media/pronunciations/en/parcel-us.mp3')
INSERT [dbo].[Pronunciations] ([id], [vocabId], [accent], [phoneticText], [audioUrl]) VALUES (35, 28, N'Other', N'/ɡlʌvz/', NULL)
SET IDENTITY_INSERT [dbo].[Pronunciations] OFF
GO
SET IDENTITY_INSERT [dbo].[Questions] ON 

INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (101, N'Despite having four years of experience in software programming, Mr. Jones hadn’t used a word processing program ______.', N'prior', N'advanced', N'previous', N'before', N'D', N'''before'' là trạng từ thích hợp theo sau một mệnh đề quá khứ.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (102, N'The employees ______ about the closure before the announcement was made public.', N'know', N'known', N'knew', N'have known', N'C', N'''knew'' là thì quá khứ đơn phù hợp với mốc thời gian.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (103, N'All visitors must ______ a security badge before entering the building.', N'obtain', N'obtaining', N'obtained', N'to obtain', N'A', N'''must'' đi với động từ nguyên mẫu không ''to'' → obtain.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (104, N'The board meeting has been postponed ______ further notice.', N'by', N'for', N'until', N'since', N'C', N'Cụm ''postponed until further notice'' là cố định.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (105, N'The marketing team is responsible for ______ the new product line to international markets.', N'introduce', N'introducing', N'introduction', N'introduced', N'B', N'''responsible for'' + V-ing → introducing.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (106, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (107, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (108, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (109, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (110, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (111, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (112, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (113, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (114, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (115, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (116, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (117, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (118, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (119, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (120, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (121, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (122, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (123, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (124, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (125, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (126, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (127, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (128, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (129, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (130, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (131, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (132, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (133, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (134, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (135, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (136, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (137, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (138, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (139, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (140, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 5)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (141, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (142, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (143, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (144, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (145, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (146, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (147, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (148, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (149, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (150, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (151, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (152, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (153, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (154, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (155, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (156, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (157, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (158, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (159, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (160, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (161, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (162, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (163, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (164, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (165, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (166, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (167, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (168, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (169, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (170, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (171, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (172, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (173, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (174, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (175, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (176, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (177, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (178, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (179, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (180, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (181, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (182, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (183, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (184, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (185, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (186, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (187, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (188, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (189, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (190, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (191, N'The CEO has asked for a detailed financial ______ before the meeting.', N'reporting', N'report', N'reported', N'reports', N'B', N'''a detailed + danh từ số ít'' → ''report''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (192, N'Jane will be in charge of the project ______ Mr. Lee is on vacation.', N'unless', N'while', N'so', N'because', N'B', N'''while'' diễn tả thời gian – đúng ngữ cảnh.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (193, N'The product launch was delayed ______ a supply chain issue.', N'because', N'due to', N'so that', N'in order', N'B', N'''due to + danh từ'' – đúng cấu trúc.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (194, N'Our staff is trained to respond to all customer inquiries ______.', N'prompt', N'promptness', N'promptly', N'prompted', N'C', N'''respond'' cần trạng từ → ''promptly''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (195, N'A receipt must be presented ______ a refund is requested.', N'if', N'but', N'although', N'despite', N'A', N'''if'' phù hợp với mệnh đề điều kiện.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (196, N'The final decision will be made ______ the board of directors.', N'with', N'by', N'at', N'from', N'B', N'''by the board'' là cấu trúc bị động đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (197, N'Mr. Kim was promoted to sales manager because of his ______ performance.', N'exceptional', N'exception', N'except', N'exceptionally', N'A', N'''performance'' cần tính từ → ''exceptional''.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (198, N'Please make sure all reports are submitted ______ the deadline.', N'since', N'before', N'after', N'until', N'B', N'''before the deadline'' là cụm đúng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (199, N'The technician explained the issue clearly and ______.', N'conclude', N'conclusion', N'conclusive', N'concisely', N'D', N'''and'' nối với trạng từ bổ nghĩa cho ''explained''.', 1, 4)
GO
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (200, N'We will offer a full refund to any customer who is not ______ satisfied.', N'entire', N'entirely', N'entirety', N'entireful', N'B', N'''entirely satisfied'' = hoàn toàn hài lòng.', 1, 4)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (201, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (202, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (203, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (204, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (205, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (206, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (207, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (208, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (209, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 3)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (210, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (211, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (212, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (213, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (214, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (215, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (216, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (217, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (218, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (219, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (220, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (221, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (222, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (223, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (224, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (225, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (226, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (227, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (228, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (229, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (230, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (231, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (232, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (233, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (234, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (235, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (236, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (237, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (238, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (239, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (240, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (241, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (242, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (243, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (244, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (245, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (246, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (247, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (248, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (249, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (250, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (251, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (252, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (253, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (254, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (255, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (256, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (257, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (258, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (259, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (260, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (261, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (262, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (263, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (264, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (265, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (266, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (267, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (268, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (269, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (270, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (271, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (272, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (273, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (274, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (275, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (276, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (277, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (278, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (279, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (280, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (281, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (282, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (283, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (284, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (285, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (286, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (287, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (288, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (289, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (290, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (291, N'The new intern performed ______ during the first week of training.', N'excellence', N'excellent', N'excellently', N'excel', N'C', N'''performed'' cần trạng từ → excellently.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (292, N'We will ship the products as soon as the payment has been ______.', N'receives', N'received', N'receiving', N'receive', N'B', N'''has been'' + V3 (bị động hiện tại hoàn thành).', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (293, N'The marketing strategy was successful in increasing product ______.', N'recognition', N'recognize', N'recognizable', N'recognized', N'A', N'''increase + danh từ'' → recognition.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (294, N'Mr. Gomez is one of the most ______ engineers in the company.', N'experience', N'experienced', N'experiencing', N'experiential', N'B', N'''most + adj'' → experienced.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (295, N'We are planning to upgrade our software to improve system ______.', N'efficient', N'efficiency', N'effort', N'effective', N'B', N'Danh từ ''efficiency'' phù hợp với ''improve''.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (296, N'Any ______ to the contract must be approved by the legal team.', N'add', N'added', N'addition', N'additions', N'D', N'‘any + danh từ số nhiều’ → additions.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (297, N'The training manual provides ______ instructions for all new hires.', N'clear', N'clearly', N'clarity', N'clearance', N'A', N'''provides + adj + noun'' → clear instructions.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (298, N'All applications must be submitted ______ the end of the month.', N'on', N'at', N'by', N'in', N'C', N'''by the end of'' là cụm chỉ hạn.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (299, N'The company has introduced a ______ policy on remote work.', N'flex', N'flexible', N'flexibility', N'flexibly', N'B', N'''a + adj + noun'' → flexible policy.', 1, NULL)
GO
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (300, N'The new website design is both functional ______ attractive.', N'but', N'and', N'or', N'so', N'B', N'''both ... and'' là cặp liên từ.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (301, N'A report ........ by the committee every year.', N'is written', N'writes', N'has written', N'writing', N'D', N'Không rõ', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (302, N'She insisted ______ paying for the meal despite our objections.', N'on', N'for', N'to', N'about', N'D', N'Không rõ', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (303, N'She insisted _____ paying for the meal despite our objections.', N'on', N'for', N'to', N'about', N'D', N'Không rõ', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (304, N'The manager demanded that the report ______ immediately.', N'is finished', N'be finished', N'was finished', N'has finished', N'D', N'Không rõ', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (305, N'The manager asked if the project could be completed ______ the end of the week.', N'until', N'by', N'on', N'during', N'A', N'bằng tiếng Việt.

Câu hỏi: The manager asked if the project could be completed ______ the end of the week.
A. until
B. by
C. on
D. during

⚠️ Bắt buộc đúng định dạng sau:
Đáp án: A/B/C/D
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.

Câu hỏi: I want to take a shower on Saturday.
A. Please
B. On request
C. Not on request
D. To request

⚠️ Bắt buộc đúng định dạng sau:
Đáp án: A/B/C/D
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.

Câu hỏi: I want to take a shower by myself on Saturday.
A. Please
B. On request
C. Not on request
D', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (306, N'The marketing team will launch the new campaign ______ the product is officially released.', N'unless', N'as soon as', N'although', N'despite', N'A', N'bằng tiếng Việt.

Câu hỏi: The marketing team will launch the new campaign ______ the product is officially released.
A. unless
B. as soon as
C. although
D. despite

⚠️ Bắt buộc đúng định dạng sau:
Đáp án: A/B/C/D
Giải thích: <giải thích ngắn bằng tiếng Việt>

Chỉ in kết quả, không thêm gì khác.

Chỉ in chương trình, không thêm gì khác.

Tại sao bắt buộc đúng?

Xin vui lòng liên hệ

Đáp án định dạng sau: A/B/C/D

Bắt buộc đúng sau: A
Bắt buộc đúng sau: C

Xin vui lòng liên hệ

Đáp án định dạng sau: A/B/C/D

Bắt bu�', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (307, N'The finance team will finalize the budget ______ the annual report is approved.', N'unless', N'as soon as', N'although', N'despite', N'B', N'"As soon as" (ngay khi) phù hợp nhất để diễn tả hành động hoàn thành ngân sách ngay sau khi báo cáo thường niên được phê duyệt. Các đáp án khác không phù hợp về mặt ngữ nghĩa.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (308, N'She will arrive ______ the meeting starts.', N'after', N'although', N'as soon as', N'unless', N'A', N'"After" (sau khi) phù hợp nhất về mặt ý nghĩa. Câu này có nghĩa là cô ấy sẽ đến sau khi cuộc họp bắt đầu. Các đáp án khác không hợp lý về nghĩa.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (309, N'Choose the correct word:
She has worked here ___ 2015.', N'since', N'for', N'in', N'at', N'A', N'"Since" được dùng để chỉ thời điểm bắt đầu của một hành động kéo dài đến hiện tại. Trong câu này, "since 2015" nghĩa là cô ấy đã làm việc ở đây từ năm 2015 đến bây giờ.', 1, NULL)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (310, N'câu hỏi test 2', N'e', N'f', N'g', N'h', N'C', N'C là đáp án chính xác', 1, 2)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (311, N'test câu hỏi 1', N'a', N'b', N'c', N'd', N'D', N'D là đáp án chính xác', 1, 2)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (312, N'đây là câu 1', N'1', N'2', N'3', N'4', N'A', N'test câu A', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (313, N'đây là câu 2', N'1', N'2', N'3', N'4', N'B', N'test câu B', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (314, N'đây là câu 3', N'1', N'2', N'3', N'4', N'C', N'test câu C', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (315, N'đây là câu 4', N'1', N'2', N'3', N'4', N'D', N'test đáp án D', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (316, N'đây là câu 1', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 1', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (317, N'đây là câu 2', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 2', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (318, N'đây là câu 3', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 3', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (319, N'đây là câu 4', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 4', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (320, N'đây là câu 5', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 5', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (321, N'đây là câu 6', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 6', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (322, N'đây là câu 7', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 7', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (323, N'đây là câu 8', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 8', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (324, N'đây là câu 9', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 9', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (325, N'đây là câu 10', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 10', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (326, N'đây là câu 11', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 11', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (327, N'đây là câu 12', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 12', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (328, N'đây là câu 13', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 13', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (329, N'đây là câu 14', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 14', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (330, N'đây là câu 15', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 15', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (331, N'đây là câu 16', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 16', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (332, N'đây là câu 17', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 17', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (333, N'đây là câu 18', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 18', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (334, N'đây là câu 19', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 19', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (335, N'đây là câu 20', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 20', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (336, N'đây là câu 21', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 21', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (337, N'đây là câu 22', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 22', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (338, N'đây là câu 23', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 23', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (339, N'đây là câu 24', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 24', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (340, N'đây là câu 25', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 25', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (341, N'đây là câu 26', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 26', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (342, N'đây là câu 27', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 27', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (343, N'đây là câu 28', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 28', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (344, N'đây là câu 29', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 29', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (345, N'đây là câu 30', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 30', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (346, N'đây là câu 31', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 31', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (347, N'đây là câu 32', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 32', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (348, N'đây là câu 33', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 33', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (349, N'đây là câu 34', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 34', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (350, N'đây là câu 35', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 35', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (351, N'đây là câu 36', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 36', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (352, N'đây là câu 37', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 37', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (353, N'đây là câu 38', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 38', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (354, N'đây là câu 39', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 39', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (355, N'đây là câu 40', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 40', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (356, N'đây là câu 1', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 1', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (357, N'đây là câu 2', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 2', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (358, N'đây là câu 3', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 3', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (359, N'đây là câu 4', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 4', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (360, N'đây là câu 5', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 5', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (361, N'đây là câu 6', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 6', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (362, N'đây là câu 7', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 7', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (363, N'đây là câu 8', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 8', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (364, N'đây là câu 9', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 9', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (365, N'đây là câu 10', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 10', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (366, N'đây là câu 13', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 13', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (367, N'đây là câu 11', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 11', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (368, N'đây là câu 12', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 12', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (369, N'đây là câu 14', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 14', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (370, N'đây là câu 15', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 15', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (371, N'đây là câu 16', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 16', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (372, N'đây là câu 17', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 17', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (373, N'đây là câu 18', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 18', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (374, N'đây là câu 19', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 19', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (375, N'đây là câu 20', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 20', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (376, N'đây là câu 21', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 21', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (377, N'đây là câu 22', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 22', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (378, N'đây là câu 23', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 23', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (379, N'đây là câu 24', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 24', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (380, N'đây là câu 25', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 25', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (381, N'đây là câu 26', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 26', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (382, N'đây là câu 27', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 27', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (383, N'đây là câu 28', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 28', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (384, N'đây là câu 29', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 29', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (385, N'đây là câu 30', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 30', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (386, N'đây là câu 31', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 31', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (387, N'đây là câu 32', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 32', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (388, N'đây là câu 33', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 33', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (389, N'đây là câu 34', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 34', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (390, N'đây là câu 35', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 35', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (391, N'đây là câu 36', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 36', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (392, N'đây là câu 37', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 37', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (393, N'đây là câu 38', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 38', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (394, N'đây là câu 39', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 39', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (395, N'đây là câu 40', N'1', N'2', N'3', N'4', N'A', N'Giải thích cho câu 40', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (396, N'câu 1', N'a', N'b', N'c', N'd', N'C', N'c đúng', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (397, N'câu 2', N'1', N'2', N'3', N'4', N'A', N'a đúng', 1, 1)
INSERT [dbo].[Questions] ([id], [question], [optionA], [optionB], [optionC], [optionD], [correctAnswer], [explanation], [typeId], [partId]) VALUES (398, N'câu 3', N'1', N'2', N'3', N'4', N'B', N'b đúng', 1, 1)
SET IDENTITY_INSERT [dbo].[Questions] OFF
GO
SET IDENTITY_INSERT [dbo].[QuestionType] ON 

INSERT [dbo].[QuestionType] ([id], [name], [description]) VALUES (1, N'Multiple Choice', N'Chọn đáp án đúng')
INSERT [dbo].[QuestionType] ([id], [name], [description]) VALUES (2, N'Fill in the Blank', N'Điền từ')
INSERT [dbo].[QuestionType] ([id], [name], [description]) VALUES (3, N'Matching', N'Nối cặp từ hoặc câu')
INSERT [dbo].[QuestionType] ([id], [name], [description]) VALUES (4, N'Rearrangement', N'Sắp xếp lại từ/câu')
INSERT [dbo].[QuestionType] ([id], [name], [description]) VALUES (5, N'True/False', N'Chọn đúng/sai')
INSERT [dbo].[QuestionType] ([id], [name], [description]) VALUES (6, N'Short Answer', N'Viết câu trả lời ngắn')
SET IDENTITY_INSERT [dbo].[QuestionType] OFF
GO
SET IDENTITY_INSERT [dbo].[Synonyms] ON 

INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (40, 13, N'favorite')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (41, 13, N'preference')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (42, 13, N'enjoy')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (43, 13, N'fancy')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (44, 13, N'love')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (45, 13, N'ilk')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (46, 13, N'as')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (47, 13, N'for example')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (48, 13, N'such as')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (49, 14, N'thorough')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (50, 14, N'precise')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (51, 14, N'painstaking')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (52, 15, N'hi')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (53, 15, N'greetings')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (54, 15, N'hey')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (55, 16, N'hello')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (56, 16, N'greetings')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (57, 16, N'salutations')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (58, 17, N'home base')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (59, 17, N'abode')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (60, 17, N'domicile')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (61, 17, N'dwelling')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (62, 17, N'house')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (63, 17, N'residence')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (64, 17, N'tenement')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (65, 17, N'homeward')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (66, 19, N'charming')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (67, 19, N'delightful')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (68, 19, N'friendly')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (69, 19, N'kind')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (70, 19, N'lovely')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (71, 19, N'pleasant')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (72, 19, N'sweet')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (73, 19, N'appetising')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (74, 19, N'appetizing')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (75, 19, N'delicious')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (76, 19, N'moreish')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (77, 19, N'scrummy')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (78, 19, N'scrumptious')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (79, 19, N'tasty')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (80, 19, N'fine')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (81, 19, N'subtle')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (82, 20, N'visible light')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (83, 20, N'set')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (84, 20, N'conflagrate')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (85, 20, N'ignite')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (86, 20, N'kindle')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (87, 20, N'illuminate')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (88, 20, N'light up')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (89, 20, N'catch fire')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (90, 20, N'bright')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (91, 20, N'lightful')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (92, 20, N'pale')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (93, 20, N'cream')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (94, 20, N'milk')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (95, 20, N'white')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (96, 20, N'delicate')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (97, 20, N'gentle')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (98, 20, N'soft')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (99, 20, N'inconsequential')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (100, 20, N'trivial')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (101, 20, N'unimportant')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (102, 20, N'lightweight')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (103, 20, N'lite')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (104, 20, N'lo-cal')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (105, 20, N'low-alcohol')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (106, 20, N'alight')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (107, 20, N'land')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (108, 20, N'chance upon')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (109, 20, N'come upon')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (110, 20, N'find')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (111, 20, N'happen upon')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (112, 20, N'hit upon')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (113, 23, N'package')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (114, 23, N'plot')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (115, 24, N'tough')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (116, 24, N'strong')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (117, 24, N'durable')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (118, 25, N'labor')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (119, 25, N'job')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (120, 25, N'task')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (121, 27, N'choice')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (122, 27, N'option')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (123, 27, N'resolution')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (124, 29, N'declaration')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (125, 29, N'statement')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (126, 29, N'proclamation')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (127, 30, N'determine')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (128, 30, N'resolve')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (129, 30, N'conclude')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (130, 31, N'muffler')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (131, 31, N'neckerchief')
INSERT [dbo].[Synonyms] ([id], [vocabId], [synonym]) VALUES (132, 31, N'stole')
SET IDENTITY_INSERT [dbo].[Synonyms] OFF
GO
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (1, 1)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (1, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (2, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (3, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (4, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (5, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (6, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (7, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (8, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (9, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (10, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (11, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (12, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (13, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (14, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (15, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (16, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (17, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (18, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (19, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (20, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (33, 2)
INSERT [dbo].[Test_Courses] ([testId], [courseId]) VALUES (34, 3)
GO
SET IDENTITY_INSERT [dbo].[TestQuestions] ON 

INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (1, 1, 101, 3)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (2, 1, 102, 4)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (3, 1, 103, 5)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (4, 1, 104, 6)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (5, 1, 105, 7)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (6, 1, 106, 8)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (7, 1, 107, 9)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (8, 1, 108, 10)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (9, 1, 109, 11)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (10, 1, 110, 12)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (11, 1, 111, 13)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (12, 1, 112, 14)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (13, 1, 113, 15)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (14, 1, 114, 16)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (15, 1, 115, 17)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (16, 1, 116, 18)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (17, 1, 117, 19)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (18, 1, 118, 20)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (19, 1, 119, 21)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (20, 1, 120, 22)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (21, 1, 121, 23)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (22, 1, 122, 24)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (23, 1, 123, 25)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (24, 1, 124, 26)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (25, 1, 125, 27)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (26, 1, 126, 28)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (27, 1, 127, 29)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (28, 1, 128, 30)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (29, 1, 129, 31)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (30, 1, 130, 32)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (31, 1, 131, 33)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (32, 1, 132, 34)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (33, 1, 133, 35)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (34, 1, 134, 36)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (35, 1, 135, 37)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (36, 1, 136, 38)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (37, 1, 137, 39)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (38, 1, 138, 40)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (39, 1, 139, 41)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (40, 1, 140, 42)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (42, 2, 142, 43)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (43, 2, 143, 44)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (44, 2, 144, 45)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (45, 2, 145, 46)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (46, 2, 146, 47)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (47, 2, 147, 48)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (48, 2, 148, 49)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (49, 2, 149, 50)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (50, 2, 150, 51)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (51, 2, 151, 52)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (52, 2, 152, 53)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (53, 2, 153, 54)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (54, 2, 154, 55)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (55, 2, 155, 56)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (56, 2, 156, 57)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (57, 2, 157, 58)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (58, 2, 158, 59)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (59, 2, 159, 60)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (60, 2, 160, 61)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (61, 2, 161, 62)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (62, 2, 162, 63)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (63, 2, 163, 64)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (64, 2, 164, 65)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (65, 2, 165, 66)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (66, 2, 166, 67)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (67, 2, 167, 68)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (68, 2, 168, 69)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (69, 2, 169, 70)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (70, 2, 170, 71)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (71, 2, 171, 72)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (72, 2, 172, 73)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (73, 2, 173, 74)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (74, 2, 174, 75)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (75, 2, 175, 76)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (76, 2, 176, 77)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (77, 2, 177, 78)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (78, 2, 178, 79)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (79, 2, 179, 80)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (80, 2, 180, 81)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (81, 2, 181, 82)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (82, 3, 182, 83)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (83, 3, 183, 84)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (84, 3, 184, 85)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (85, 3, 185, 86)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (86, 3, 186, 87)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (87, 3, 187, 88)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (88, 3, 188, 89)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (89, 3, 189, 90)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (90, 3, 190, 91)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (91, 3, 191, 92)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (92, 3, 192, 93)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (93, 3, 193, 94)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (94, 3, 194, 95)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (95, 3, 195, 96)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (96, 3, 196, 97)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (97, 3, 197, 98)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (98, 3, 198, 99)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (99, 3, 199, 100)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (100, 3, 200, 101)
GO
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (101, 3, 201, 102)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (102, 3, 202, 103)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (103, 3, 203, 104)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (104, 3, 204, 105)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (105, 3, 205, 106)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (106, 3, 206, 107)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (107, 3, 207, 108)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (108, 3, 208, 109)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (109, 3, 209, 110)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (110, 3, 210, 111)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (111, 3, 211, 112)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (122, 4, 212, 113)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (123, 4, 213, 114)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (124, 4, 214, 115)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (125, 4, 215, 116)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (126, 4, 216, 117)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (127, 4, 217, 118)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (128, 4, 218, 119)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (129, 4, 219, 120)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (130, 4, 220, 121)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (131, 4, 221, 122)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (132, 4, 222, 123)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (133, 4, 223, 124)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (134, 4, 224, 125)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (135, 4, 225, 126)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (136, 4, 226, 127)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (137, 4, 227, 128)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (138, 4, 228, 129)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (139, 4, 229, 130)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (140, 4, 230, 131)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (141, 4, 231, 132)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (142, 4, 232, 133)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (143, 4, 233, 134)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (144, 4, 234, 135)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (145, 4, 235, 136)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (146, 4, 236, 137)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (147, 4, 237, 138)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (148, 4, 238, 139)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (149, 4, 239, 140)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (150, 4, 240, 141)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (151, 4, 241, 142)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (152, 4, 242, 143)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (153, 4, 243, 144)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (154, 4, 244, 145)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (155, 4, 245, 146)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (156, 4, 246, 147)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (157, 4, 247, 148)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (158, 4, 248, 149)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (159, 4, 249, 150)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (160, 4, 250, 151)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (161, 4, 251, 152)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (164, 3, 272, 153)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (165, 3, 273, 154)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (166, 3, 274, 155)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (167, 3, 275, 156)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (168, 3, 276, 157)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (169, 3, 277, 158)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (170, 3, 278, 159)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (171, 3, 279, 160)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (172, 3, 280, 161)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (173, 3, 281, 162)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (221, 33, 356, 1)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (222, 33, 357, 2)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (223, 33, 358, 3)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (224, 33, 359, 4)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (225, 33, 360, 5)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (226, 33, 361, 6)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (227, 33, 362, 7)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (228, 33, 363, 8)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (229, 33, 364, 9)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (230, 33, 365, 10)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (231, 33, 367, 11)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (232, 33, 368, 12)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (233, 33, 366, 13)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (234, 33, 369, 14)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (235, 33, 370, 15)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (236, 33, 371, 16)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (237, 33, 372, 17)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (238, 33, 373, 18)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (239, 33, 374, 19)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (240, 33, 375, 20)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (241, 33, 376, 21)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (242, 33, 377, 22)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (243, 33, 378, 23)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (244, 33, 379, 24)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (245, 33, 380, 25)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (246, 33, 381, 26)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (247, 33, 382, 27)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (248, 33, 383, 28)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (249, 33, 384, 29)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (250, 33, 385, 30)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (251, 33, 386, 31)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (252, 33, 387, 32)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (253, 33, 388, 33)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (254, 33, 389, 34)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (255, 33, 390, 35)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (256, 33, 391, 36)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (257, 33, 392, 37)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (258, 33, 393, 38)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (259, 33, 394, 39)
GO
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (260, 33, 395, 40)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (261, 34, 396, 1)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (262, 34, 397, 2)
INSERT [dbo].[TestQuestions] ([id], [testId], [questionId], [sortOrder]) VALUES (263, 34, 398, 3)
SET IDENTITY_INSERT [dbo].[TestQuestions] OFF
GO
SET IDENTITY_INSERT [dbo].[Tests] ON 

INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (1, N'IELTS Simulation Listening test 1', N'40 phút', 5, 3038, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (2, N'IELTS Simulation Listening test 2', N'40 phút', 0, 879, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (3, N'IELTS Simulation Listening test 3', N'40 phút', 0, 498, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (4, N'IELTS Simulation Listening test 4', N'40 phút', 0, 435, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (5, N'IELTS Simulation Listening test 5', N'40 phút', 0, 337, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (6, N'IELTS Simulation Listening test 6', N'40 phút', 0, 317, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (7, N'IELTS Simulation Listening test 7', N'40 phút', 0, 238, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (8, N'IELTS Simulation Listening test 8', N'40 phút', 0, 192, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (9, N'IELTS Simulation Listening test 9', N'40 phút', 0, 134, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (10, N'IELTS Simulation Listening test 10', N'40 phút', 0, 902, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (11, N'IELTS Simulation Listening test 11', N'40 phút', 0, 789, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (12, N'IELTS Simulation Listening test 12', N'40 phút', 0, 654, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (13, N'IELTS Simulation Listening test 13', N'40 phút', 0, 543, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (14, N'IELTS Simulation Listening test 14', N'40 phút', 0, 432, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (15, N'IELTS Simulation Listening test 15', N'40 phút', 0, 321, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (16, N'IELTS Simulation Listening test 16', N'40 phút', 0, 298, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (17, N'IELTS Simulation Listening test 17', N'40 phút', 0, 267, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (18, N'IELTS Simulation Listening test 18', N'40 phút', 0, 198, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (19, N'IELTS Simulation Listening test 19', N'40 phút', 0, 167, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (20, N'IELTS Simulation Listening test 20', N'40 phút', 0, 145, 40)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (33, N'test đề thi ielts', N'45 minutes', 0, NULL, 0)
INSERT [dbo].[Tests] ([id], [title], [duration], [participants], [comments], [questions]) VALUES (34, N'test chấm điểm', N'45 minutes', 9, NULL, 0)
SET IDENTITY_INSERT [dbo].[Tests] OFF
GO
SET IDENTITY_INSERT [dbo].[UserResults] ON 

INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (601, NULL, 101, 1, CAST(N'2025-07-17T09:26:41.5540000+00:00' AS DateTimeOffset), N'D', 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (602, NULL, 102, 0, CAST(N'2025-07-17T09:26:41.5570000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (603, NULL, 103, 0, CAST(N'2025-07-17T09:26:41.5600000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (604, NULL, 104, 0, CAST(N'2025-07-17T09:26:41.5630000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (605, NULL, 105, 0, CAST(N'2025-07-17T09:26:41.5670000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (606, NULL, 106, 0, CAST(N'2025-07-17T09:26:41.5690000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (607, NULL, 107, 0, CAST(N'2025-07-17T09:26:41.5720000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (608, NULL, 108, 0, CAST(N'2025-07-17T09:26:41.5760000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (609, NULL, 109, 0, CAST(N'2025-07-17T09:26:41.5800000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (610, NULL, 110, 0, CAST(N'2025-07-17T09:26:41.5830000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (611, NULL, 111, 0, CAST(N'2025-07-17T09:26:41.5860000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (612, NULL, 112, 0, CAST(N'2025-07-17T09:26:41.5900000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (613, NULL, 113, 0, CAST(N'2025-07-17T09:26:41.5930000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (614, NULL, 114, 0, CAST(N'2025-07-17T09:26:41.5960000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (615, NULL, 115, 0, CAST(N'2025-07-17T09:26:41.6000000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (616, NULL, 116, 0, CAST(N'2025-07-17T09:26:41.6030000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (617, NULL, 117, 0, CAST(N'2025-07-17T09:26:41.6080000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (618, NULL, 118, 0, CAST(N'2025-07-17T09:26:41.6110000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (619, NULL, 119, 0, CAST(N'2025-07-17T09:26:41.6150000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (620, NULL, 120, 0, CAST(N'2025-07-17T09:26:41.6170000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (621, NULL, 121, 0, CAST(N'2025-07-17T09:26:41.6210000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (622, NULL, 122, 0, CAST(N'2025-07-17T09:26:41.6250000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (623, NULL, 123, 0, CAST(N'2025-07-17T09:26:41.6280000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (624, NULL, 124, 0, CAST(N'2025-07-17T09:26:41.6310000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (625, NULL, 125, 0, CAST(N'2025-07-17T09:26:41.6330000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (626, NULL, 126, 0, CAST(N'2025-07-17T09:26:41.6360000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (627, NULL, 127, 0, CAST(N'2025-07-17T09:26:41.6380000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (628, NULL, 128, 0, CAST(N'2025-07-17T09:26:41.6400000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (629, NULL, 129, 0, CAST(N'2025-07-17T09:26:41.6430000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (630, NULL, 130, 0, CAST(N'2025-07-17T09:26:41.6450000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (631, NULL, 131, 0, CAST(N'2025-07-17T09:26:41.6480000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (632, NULL, 132, 0, CAST(N'2025-07-17T09:26:41.6500000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (633, NULL, 133, 0, CAST(N'2025-07-17T09:26:41.6520000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (634, NULL, 134, 0, CAST(N'2025-07-17T09:26:41.6550000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (635, NULL, 135, 0, CAST(N'2025-07-17T09:26:41.6580000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (636, NULL, 136, 0, CAST(N'2025-07-17T09:26:41.6600000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (637, NULL, 137, 0, CAST(N'2025-07-17T09:26:41.6630000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (638, NULL, 138, 0, CAST(N'2025-07-17T09:26:41.6670000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (639, NULL, 139, 0, CAST(N'2025-07-17T09:26:41.6690000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (640, NULL, 140, 0, CAST(N'2025-07-17T09:26:41.6710000+00:00' AS DateTimeOffset), NULL, 18)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (641, NULL, 310, 0, CAST(N'2025-07-18T09:06:47.1060000+00:00' AS DateTimeOffset), N'D', 19)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (642, NULL, 311, 0, CAST(N'2025-07-18T09:06:47.1080000+00:00' AS DateTimeOffset), N'C', 19)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (643, NULL, 312, 1, CAST(N'2025-07-18T09:21:22.0310000+00:00' AS DateTimeOffset), N'A', 21)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (644, NULL, 313, 1, CAST(N'2025-07-18T09:21:22.0340000+00:00' AS DateTimeOffset), N'B', 21)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (645, NULL, 314, 1, CAST(N'2025-07-18T09:21:22.0380000+00:00' AS DateTimeOffset), N'C', 21)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (646, NULL, 315, 1, CAST(N'2025-07-18T09:21:22.0440000+00:00' AS DateTimeOffset), N'D', 21)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (647, NULL, 396, 1, CAST(N'2025-07-22T08:39:36.0460000+00:00' AS DateTimeOffset), N'C', 22)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (648, NULL, 397, 1, CAST(N'2025-07-22T08:39:36.0490000+00:00' AS DateTimeOffset), N'A', 22)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (649, NULL, 398, 0, CAST(N'2025-07-22T08:39:36.0510000+00:00' AS DateTimeOffset), N'A', 22)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (650, NULL, 396, 1, CAST(N'2025-07-22T08:53:36.9240000+00:00' AS DateTimeOffset), N'C', 23)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (651, NULL, 397, 0, CAST(N'2025-07-22T08:53:36.9270000+00:00' AS DateTimeOffset), N'B', 23)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (652, NULL, 398, 1, CAST(N'2025-07-22T08:53:36.9300000+00:00' AS DateTimeOffset), N'B', 23)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (653, NULL, 396, 1, CAST(N'2025-07-22T08:58:26.1910000+00:00' AS DateTimeOffset), N'C', 24)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (654, NULL, 397, 0, CAST(N'2025-07-22T08:58:26.1940000+00:00' AS DateTimeOffset), N'B', 24)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (655, NULL, 398, 0, CAST(N'2025-07-22T08:58:26.1970000+00:00' AS DateTimeOffset), N'A', 24)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (656, NULL, 101, 1, CAST(N'2025-07-22T09:00:10.0940000+00:00' AS DateTimeOffset), N'D', 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (657, NULL, 102, 1, CAST(N'2025-07-22T09:00:10.0970000+00:00' AS DateTimeOffset), N'C', 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (658, NULL, 103, 0, CAST(N'2025-07-22T09:00:10.0990000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (659, NULL, 104, 0, CAST(N'2025-07-22T09:00:10.1020000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (660, NULL, 105, 0, CAST(N'2025-07-22T09:00:10.1040000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (661, NULL, 106, 0, CAST(N'2025-07-22T09:00:10.1070000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (662, NULL, 107, 0, CAST(N'2025-07-22T09:00:10.1090000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (663, NULL, 108, 0, CAST(N'2025-07-22T09:00:10.1120000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (664, NULL, 109, 0, CAST(N'2025-07-22T09:00:10.1150000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (665, NULL, 110, 0, CAST(N'2025-07-22T09:00:10.1180000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (666, NULL, 111, 0, CAST(N'2025-07-22T09:00:10.1200000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (667, NULL, 112, 0, CAST(N'2025-07-22T09:00:10.1240000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (668, NULL, 113, 0, CAST(N'2025-07-22T09:00:10.1270000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (669, NULL, 114, 0, CAST(N'2025-07-22T09:00:10.1290000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (670, NULL, 115, 0, CAST(N'2025-07-22T09:00:10.1320000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (671, NULL, 116, 0, CAST(N'2025-07-22T09:00:10.1340000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (672, NULL, 117, 0, CAST(N'2025-07-22T09:00:10.1370000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (673, NULL, 118, 0, CAST(N'2025-07-22T09:00:10.1390000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (674, NULL, 119, 0, CAST(N'2025-07-22T09:00:10.1420000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (675, NULL, 120, 0, CAST(N'2025-07-22T09:00:10.1450000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (676, NULL, 121, 0, CAST(N'2025-07-22T09:00:10.1480000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (677, NULL, 122, 0, CAST(N'2025-07-22T09:00:10.1510000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (678, NULL, 123, 0, CAST(N'2025-07-22T09:00:10.1540000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (679, NULL, 124, 0, CAST(N'2025-07-22T09:00:10.1580000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (680, NULL, 125, 0, CAST(N'2025-07-22T09:00:10.1610000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (681, NULL, 126, 0, CAST(N'2025-07-22T09:00:10.1640000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (682, NULL, 127, 0, CAST(N'2025-07-22T09:00:10.1660000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (683, NULL, 128, 0, CAST(N'2025-07-22T09:00:10.1680000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (684, NULL, 129, 0, CAST(N'2025-07-22T09:00:10.1710000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (685, NULL, 130, 0, CAST(N'2025-07-22T09:00:10.1740000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (686, NULL, 131, 0, CAST(N'2025-07-22T09:00:10.1760000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (687, NULL, 132, 0, CAST(N'2025-07-22T09:00:10.1790000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (688, NULL, 133, 0, CAST(N'2025-07-22T09:00:10.1810000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (689, NULL, 134, 0, CAST(N'2025-07-22T09:00:10.1830000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (690, NULL, 135, 0, CAST(N'2025-07-22T09:00:10.1850000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (691, NULL, 136, 0, CAST(N'2025-07-22T09:00:10.1880000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (692, NULL, 137, 0, CAST(N'2025-07-22T09:00:10.1910000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (693, NULL, 138, 0, CAST(N'2025-07-22T09:00:10.1950000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (694, NULL, 139, 0, CAST(N'2025-07-22T09:00:10.1970000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (695, NULL, 140, 0, CAST(N'2025-07-22T09:00:10.1990000+00:00' AS DateTimeOffset), NULL, 25)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (696, NULL, 101, 1, CAST(N'2025-07-22T09:13:11.3410000+00:00' AS DateTimeOffset), N'D', 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (697, NULL, 102, 1, CAST(N'2025-07-22T09:13:11.3450000+00:00' AS DateTimeOffset), N'C', 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (698, NULL, 103, 0, CAST(N'2025-07-22T09:13:11.3550000+00:00' AS DateTimeOffset), N'B', 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (699, NULL, 104, 1, CAST(N'2025-07-22T09:13:11.3590000+00:00' AS DateTimeOffset), N'C', 26)
GO
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (700, NULL, 105, 0, CAST(N'2025-07-22T09:13:11.3620000+00:00' AS DateTimeOffset), N'C', 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (701, NULL, 106, 0, CAST(N'2025-07-22T09:13:11.3650000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (702, NULL, 107, 0, CAST(N'2025-07-22T09:13:11.3680000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (703, NULL, 108, 0, CAST(N'2025-07-22T09:13:11.3720000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (704, NULL, 109, 0, CAST(N'2025-07-22T09:13:11.3750000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (705, NULL, 110, 0, CAST(N'2025-07-22T09:13:11.3780000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (706, NULL, 111, 0, CAST(N'2025-07-22T09:13:11.3820000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (707, NULL, 112, 0, CAST(N'2025-07-22T09:13:11.3850000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (708, NULL, 113, 0, CAST(N'2025-07-22T09:13:11.3880000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (709, NULL, 114, 0, CAST(N'2025-07-22T09:13:11.3910000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (710, NULL, 115, 0, CAST(N'2025-07-22T09:13:11.3940000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (711, NULL, 116, 0, CAST(N'2025-07-22T09:13:11.3980000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (712, NULL, 117, 0, CAST(N'2025-07-22T09:13:11.4010000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (713, NULL, 118, 0, CAST(N'2025-07-22T09:13:11.4050000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (714, NULL, 119, 0, CAST(N'2025-07-22T09:13:11.4070000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (715, NULL, 120, 0, CAST(N'2025-07-22T09:13:11.4100000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (716, NULL, 121, 0, CAST(N'2025-07-22T09:13:11.4140000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (717, NULL, 122, 0, CAST(N'2025-07-22T09:13:11.4170000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (718, NULL, 123, 0, CAST(N'2025-07-22T09:13:11.4200000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (719, NULL, 124, 0, CAST(N'2025-07-22T09:13:11.4230000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (720, NULL, 125, 0, CAST(N'2025-07-22T09:13:11.4280000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (721, NULL, 126, 0, CAST(N'2025-07-22T09:13:11.4320000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (722, NULL, 127, 0, CAST(N'2025-07-22T09:13:11.4350000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (723, NULL, 128, 0, CAST(N'2025-07-22T09:13:11.4380000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (724, NULL, 129, 0, CAST(N'2025-07-22T09:13:11.4420000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (725, NULL, 130, 0, CAST(N'2025-07-22T09:13:11.4460000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (726, NULL, 131, 0, CAST(N'2025-07-22T09:13:11.4490000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (727, NULL, 132, 0, CAST(N'2025-07-22T09:13:11.4530000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (728, NULL, 133, 0, CAST(N'2025-07-22T09:13:11.4560000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (729, NULL, 134, 0, CAST(N'2025-07-22T09:13:11.4580000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (730, NULL, 135, 0, CAST(N'2025-07-22T09:13:11.4610000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (731, NULL, 136, 0, CAST(N'2025-07-22T09:13:11.4630000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (732, NULL, 137, 0, CAST(N'2025-07-22T09:13:11.4650000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (733, NULL, 138, 0, CAST(N'2025-07-22T09:13:11.4670000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (734, NULL, 139, 0, CAST(N'2025-07-22T09:13:11.4700000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (735, NULL, 140, 0, CAST(N'2025-07-22T09:13:11.4720000+00:00' AS DateTimeOffset), NULL, 26)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (736, NULL, 396, 1, CAST(N'2025-07-22T09:13:35.8800000+00:00' AS DateTimeOffset), N'C', 27)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (737, NULL, 397, 0, CAST(N'2025-07-22T09:13:35.8830000+00:00' AS DateTimeOffset), N'B', 27)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (738, NULL, 398, 0, CAST(N'2025-07-22T09:13:35.8850000+00:00' AS DateTimeOffset), N'A', 27)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (739, NULL, 396, 0, CAST(N'2025-07-22T09:18:47.0460000+00:00' AS DateTimeOffset), NULL, 28)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (740, NULL, 397, 0, CAST(N'2025-07-22T09:18:47.0500000+00:00' AS DateTimeOffset), NULL, 28)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (741, NULL, 398, 0, CAST(N'2025-07-22T09:18:47.0520000+00:00' AS DateTimeOffset), NULL, 28)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (742, NULL, 396, 1, CAST(N'2025-07-23T08:55:43.5580000+00:00' AS DateTimeOffset), N'C', 29)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (743, NULL, 397, 0, CAST(N'2025-07-23T08:55:43.5600000+00:00' AS DateTimeOffset), N'B', 29)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (744, NULL, 398, 0, CAST(N'2025-07-23T08:55:43.5620000+00:00' AS DateTimeOffset), N'A', 29)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (745, NULL, 396, 0, CAST(N'2025-07-23T08:58:12.4740000+00:00' AS DateTimeOffset), N'B', 30)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (746, NULL, 397, 0, CAST(N'2025-07-23T08:58:12.4780000+00:00' AS DateTimeOffset), N'C', 30)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (747, NULL, 398, 0, CAST(N'2025-07-23T08:58:12.4810000+00:00' AS DateTimeOffset), N'A', 30)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (748, NULL, 396, 1, CAST(N'2025-07-23T10:14:04.9320000+00:00' AS DateTimeOffset), N'C', 31)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (749, NULL, 397, 1, CAST(N'2025-07-23T10:14:04.9360000+00:00' AS DateTimeOffset), N'A', 31)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (750, NULL, 398, 1, CAST(N'2025-07-23T10:14:04.9410000+00:00' AS DateTimeOffset), N'B', 31)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (751, 6, 396, 1, CAST(N'2025-07-23T10:17:20.9260000+00:00' AS DateTimeOffset), N'C', 32)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (752, 6, 397, 1, CAST(N'2025-07-23T10:17:20.9290000+00:00' AS DateTimeOffset), N'A', 32)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (753, 6, 398, 1, CAST(N'2025-07-23T10:17:20.9320000+00:00' AS DateTimeOffset), N'B', 32)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (754, 6, 101, 0, CAST(N'2025-07-23T10:21:03.6140000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (755, 6, 102, 0, CAST(N'2025-07-23T10:21:03.6180000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (756, 6, 103, 0, CAST(N'2025-07-23T10:21:03.6210000+00:00' AS DateTimeOffset), N'C', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (757, 6, 104, 0, CAST(N'2025-07-23T10:21:03.6240000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (758, 6, 105, 1, CAST(N'2025-07-23T10:21:03.6270000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (759, 6, 106, 0, CAST(N'2025-07-23T10:21:03.6300000+00:00' AS DateTimeOffset), N'C', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (760, 6, 107, 0, CAST(N'2025-07-23T10:21:03.6330000+00:00' AS DateTimeOffset), N'C', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (761, 6, 108, 0, CAST(N'2025-07-23T10:21:03.6360000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (762, 6, 109, 0, CAST(N'2025-07-23T10:21:03.6400000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (763, 6, 110, 1, CAST(N'2025-07-23T10:21:03.6440000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (764, 6, 111, 0, CAST(N'2025-07-23T10:21:03.6480000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (765, 6, 112, 0, CAST(N'2025-07-23T10:21:03.6510000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (766, 6, 113, 0, CAST(N'2025-07-23T10:21:03.6540000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (767, 6, 114, 0, CAST(N'2025-07-23T10:21:03.6570000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (768, 6, 115, 0, CAST(N'2025-07-23T10:21:03.6590000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (769, 6, 116, 0, CAST(N'2025-07-23T10:21:03.6630000+00:00' AS DateTimeOffset), N'C', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (770, 6, 117, 0, CAST(N'2025-07-23T10:21:03.6670000+00:00' AS DateTimeOffset), N'C', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (771, 6, 118, 1, CAST(N'2025-07-23T10:21:03.6710000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (772, 6, 119, 0, CAST(N'2025-07-23T10:21:03.6740000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (773, 6, 120, 0, CAST(N'2025-07-23T10:21:03.6770000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (774, 6, 121, 0, CAST(N'2025-07-23T10:21:03.6800000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (775, 6, 122, 0, CAST(N'2025-07-23T10:21:03.6830000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (776, 6, 123, 0, CAST(N'2025-07-23T10:21:03.6890000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (777, 6, 124, 1, CAST(N'2025-07-23T10:21:03.6940000+00:00' AS DateTimeOffset), N'C', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (778, 6, 125, 0, CAST(N'2025-07-23T10:21:03.6970000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (779, 6, 126, 0, CAST(N'2025-07-23T10:21:03.7020000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (780, 6, 127, 1, CAST(N'2025-07-23T10:21:03.7050000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (781, 6, 128, 1, CAST(N'2025-07-23T10:21:03.7070000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (782, 6, 129, 0, CAST(N'2025-07-23T10:21:03.7100000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (783, 6, 130, 1, CAST(N'2025-07-23T10:21:03.7130000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (784, 6, 131, 0, CAST(N'2025-07-23T10:21:03.7150000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (785, 6, 132, 1, CAST(N'2025-07-23T10:21:03.7180000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (786, 6, 133, 0, CAST(N'2025-07-23T10:21:03.7210000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (787, 6, 134, 0, CAST(N'2025-07-23T10:21:03.7230000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (788, 6, 135, 0, CAST(N'2025-07-23T10:21:03.7250000+00:00' AS DateTimeOffset), N'B', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (789, 6, 136, 0, CAST(N'2025-07-23T10:21:03.7270000+00:00' AS DateTimeOffset), N'D', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (790, 6, 137, 1, CAST(N'2025-07-23T10:21:03.7300000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (791, 6, 138, 0, CAST(N'2025-07-23T10:21:03.7320000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (792, 6, 139, 0, CAST(N'2025-07-23T10:21:03.7340000+00:00' AS DateTimeOffset), N'A', 33)
INSERT [dbo].[UserResults] ([id], [userId], [questionId], [isCorrect], [answeredAt], [selectedOption], [userTestId]) VALUES (793, 6, 140, 1, CAST(N'2025-07-23T10:21:03.7360000+00:00' AS DateTimeOffset), N'B', 33)
SET IDENTITY_INSERT [dbo].[UserResults] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([id], [username], [email], [password], [role_id], [avatar], [status]) VALUES (3, N'phamhung', N'phamtuanhung9a5@gmail.com', N'$2b$10$OTxADGAlefFSoiMMka.uhOo7IYCS8YaHWI5ArxoFfgG7Z.ycIVc2K', 2, NULL, 1)
INSERT [dbo].[Users] ([id], [username], [email], [password], [role_id], [avatar], [status]) VALUES (6, N'Phạm Tuấn Hưng', N'hungneverdie24@gmail.com', N'$2b$10$OTxADGAlefFSoiMMka.uhOo7IYCS8YaHWI5ArxoFfgG7Z.ycIVc2K', 1, NULL, 1)
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
SET IDENTITY_INSERT [dbo].[UserTests] ON 

INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (17, 3, 1, 1, CAST(N'2025-07-17T04:58:18.4460000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T04:58:27.5380000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (18, 3, 1, 0, CAST(N'2025-07-17T09:26:39.0540000+00:00' AS DateTimeOffset), CAST(N'2025-07-17T09:26:41.7100000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (22, 3, 34, 6, CAST(N'2025-07-22T08:39:26.6120000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T08:39:36.0620000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (23, 3, 34, 6.7, CAST(N'2025-07-22T08:53:29.2540000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T08:53:36.9440000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (24, 3, 34, 3.3, CAST(N'2025-07-22T08:58:19.7180000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T08:58:26.2080000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (25, 3, 1, 0.5, CAST(N'2025-07-22T08:59:54.8790000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T09:00:10.2240000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (26, 3, 1, 0.8, CAST(N'2025-07-22T09:04:40.3960000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T09:13:11.5040000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (27, 3, 34, 3.3, CAST(N'2025-07-22T09:13:18.4790000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T09:13:35.8950000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (28, 3, 34, 0, CAST(N'2025-07-22T09:14:22.1140000+00:00' AS DateTimeOffset), CAST(N'2025-07-22T09:18:47.0660000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (29, 6, 34, 3.3, CAST(N'2025-07-23T08:55:37.9770000+00:00' AS DateTimeOffset), CAST(N'2025-07-23T08:55:43.5770000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (30, 6, 34, 0, CAST(N'2025-07-23T08:55:59.7170000+00:00' AS DateTimeOffset), CAST(N'2025-07-23T08:58:12.4980000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (31, 6, 34, 10, CAST(N'2025-07-23T10:14:00.1490000+00:00' AS DateTimeOffset), CAST(N'2025-07-23T10:14:04.9590000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (32, 6, 34, 10, CAST(N'2025-07-23T10:17:17.1070000+00:00' AS DateTimeOffset), CAST(N'2025-07-23T10:17:20.9500000+00:00' AS DateTimeOffset), N'completed')
INSERT [dbo].[UserTests] ([id], [userId], [testId], [score], [startedAt], [completedAt], [status]) VALUES (33, 6, 1, 2.5, CAST(N'2025-07-23T10:20:28.0910000+00:00' AS DateTimeOffset), CAST(N'2025-07-23T10:21:03.7710000+00:00' AS DateTimeOffset), N'completed')
SET IDENTITY_INSERT [dbo].[UserTests] OFF
GO
SET IDENTITY_INSERT [dbo].[Vocabulary] ON 

INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (13, N'like', N'(usually in the plural) Something that a person likes (prefers).', N'Tell me your likes and dislikes.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (14, N'meticulous', N'showing great attention to detail; very careful and precise.', N'She was meticulous in her preparation for the exam.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (15, N'hello', N'A greeting or expression of goodwill.', N'Hello, how are you today?', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (16, N'hi', N'a greeting; an expression of friendliness.', N'She said "Hi" and waved.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (17, N'home', N'The locality where a thing is usually found, or was first found, or where it is naturally abundant; habitat; seat.', N'the home of the pine', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (18, N'concentrate', N'To bring to, or direct toward, a common center; to unite more closely; to gather into one body, mass, or force.', N'to concentrate rays of light into a focus', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (19, N'nice', N'Respectable; virtuous.', N'What is a nice person like you doing in a place like this?', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (20, N'light', N'Visible electromagnetic radiation. The human eye can typically detect radiation (light) in the wavelength range of about 400 to 750 nanometers. Nearby shorter and longer wavelength ranges, although not visible, are commonly called ultraviolet and infrared light.', N'As you can see, this spacious dining-room gets a lot of light in the mornings.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (21, N'conglomerate', N'Clustered together into a mass.', N'conglomerate flowers', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (22, N'neanderthal', N'Of or pertaining to Homo neanderthalensis.', N'The capacity of the Neanderthal skull was 10% larger than that of modern humans.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (23, N'parcel', N'A package wrapped for shipment.', N'I saw a brown paper parcel on my doorstep.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (24, N'resilient', N'Able to recover quickly from difficulties; tough.', N'The human body is remarkably resilient.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (25, N'work', N'Activity involving mental or physical effort done in order to achieve a purpose or result.', N'She has a lot of work to do.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (26, N'csc', N'In a right triangle, the reciprocal of the sine of an angle. Symbols: cosec, csc', NULL, N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (27, N'decision', N'A conclusion or resolution reached after consideration.', N'He had to make a difficult decision.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (28, N'gloves', N'An item of clothing other than a mitten, covering all or part of the hand and fingers, but usually allowing independent movement of the fingers.', N'I wore gloves to keep my hands warm.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (29, N'announcerment', N'This appears to be a misspelling of "announcement". An announcement is a public or formal notice about a fact, occurrence, or intention.', N'The company made an announcement about the new product launch.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (30, N'decide to', N'To make a choice or judgment about something, especially after considering all the possibilities.', N'I decided to go to the beach this weekend.', N'general')
INSERT [dbo].[Vocabulary] ([id], [word], [definition], [example], [topic]) VALUES (31, N'scarf', N'A length of fabric worn around the neck or head for warmth, fashion, or ceremonial purposes.', N'She wore a silk scarf around her neck.', N'general')
SET IDENTITY_INSERT [dbo].[Vocabulary] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Courses__72E12F1BF489BB15]    Script Date: 7/24/2025 12:31:20 AM ******/
ALTER TABLE [dbo].[Courses] ADD UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_TestQuestion]    Script Date: 7/24/2025 12:31:20 AM ******/
ALTER TABLE [dbo].[TestQuestions] ADD  CONSTRAINT [UQ_TestQuestion] UNIQUE NONCLUSTERED 
(
	[testId] ASC,
	[questionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__AB6E61648A95BD38]    Script Date: 7/24/2025 12:31:20 AM ******/
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [UQ__Users__AB6E61648A95BD38] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Conversations] ADD  CONSTRAINT [DF__Conversat__creat__160F4887]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Conversations] ADD  CONSTRAINT [DF__Conversat__updat__17036CC0]  DEFAULT (getdate()) FOR [updatedAt]
GO
ALTER TABLE [dbo].[Logs] ADD  DEFAULT (getdate()) FOR [timestamp]
GO
ALTER TABLE [dbo].[Messages] ADD  CONSTRAINT [DF__Messages__create__1BC821DD]  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Messages] ADD  CONSTRAINT [DF__Messages__update__1CBC4616]  DEFAULT (getdate()) FOR [updatedAt]
GO
ALTER TABLE [dbo].[Tests] ADD  DEFAULT ((0)) FOR [participants]
GO
ALTER TABLE [dbo].[Tests] ADD  DEFAULT ((0)) FOR [comments]
GO
ALTER TABLE [dbo].[Tests] ADD  DEFAULT ((0)) FOR [questions]
GO
ALTER TABLE [dbo].[UserResults] ADD  CONSTRAINT [DF__UserResul__answe__6383C8BA]  DEFAULT (getdate()) FOR [answeredAt]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF__Users__role_id__1EA48E88]  DEFAULT ((1)) FOR [role_id]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[UserTests] ADD  CONSTRAINT [DF__UserTests__start__1B9317B3]  DEFAULT (getdate()) FOR [startedAt]
GO
ALTER TABLE [dbo].[UserTests] ADD  CONSTRAINT [DF__UserTests__statu__1C873BEC]  DEFAULT ('unfinished') FOR [status]
GO
ALTER TABLE [dbo].[UserVocabulary] ADD  DEFAULT ((0)) FOR [reviewCount]
GO
ALTER TABLE [dbo].[UserVocabulary] ADD  DEFAULT ((0)) FOR [isMastered]
GO
ALTER TABLE [dbo].[Antonyms]  WITH CHECK ADD FOREIGN KEY([vocabId])
REFERENCES [dbo].[Vocabulary] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Conversations]  WITH CHECK ADD  CONSTRAINT [fk_conversations_user] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Conversations] CHECK CONSTRAINT [fk_conversations_user]
GO
ALTER TABLE [dbo].[Logs]  WITH CHECK ADD  CONSTRAINT [FK__Logs__userId__6754599E] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Logs] CHECK CONSTRAINT [FK__Logs__userId__6754599E]
GO
ALTER TABLE [dbo].[Meanings]  WITH CHECK ADD FOREIGN KEY([vocabId])
REFERENCES [dbo].[Vocabulary] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [fk_messages_conversation] FOREIGN KEY([conversationId])
REFERENCES [dbo].[Conversations] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [fk_messages_conversation]
GO
ALTER TABLE [dbo].[Pronunciations]  WITH CHECK ADD FOREIGN KEY([vocabId])
REFERENCES [dbo].[Vocabulary] ([id])
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [FK_Questions_Part] FOREIGN KEY([partId])
REFERENCES [dbo].[Part] ([id])
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [FK_Questions_Part]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD  CONSTRAINT [FK_Questions_QuestionType] FOREIGN KEY([typeId])
REFERENCES [dbo].[QuestionType] ([id])
GO
ALTER TABLE [dbo].[Questions] CHECK CONSTRAINT [FK_Questions_QuestionType]
GO
ALTER TABLE [dbo].[Synonyms]  WITH CHECK ADD FOREIGN KEY([vocabId])
REFERENCES [dbo].[Vocabulary] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Test_Courses]  WITH CHECK ADD FOREIGN KEY([courseId])
REFERENCES [dbo].[Courses] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Test_Courses]  WITH CHECK ADD FOREIGN KEY([testId])
REFERENCES [dbo].[Tests] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TestQuestions]  WITH CHECK ADD  CONSTRAINT [FK_TestQuestions_Questions] FOREIGN KEY([questionId])
REFERENCES [dbo].[Questions] ([id])
GO
ALTER TABLE [dbo].[TestQuestions] CHECK CONSTRAINT [FK_TestQuestions_Questions]
GO
ALTER TABLE [dbo].[TestQuestions]  WITH CHECK ADD  CONSTRAINT [FK_TestQuestions_Tests] FOREIGN KEY([testId])
REFERENCES [dbo].[Tests] ([id])
GO
ALTER TABLE [dbo].[TestQuestions] CHECK CONSTRAINT [FK_TestQuestions_Tests]
GO
ALTER TABLE [dbo].[UserResults]  WITH CHECK ADD  CONSTRAINT [FK__UserResul__quest__628FA481] FOREIGN KEY([questionId])
REFERENCES [dbo].[Questions] ([id])
GO
ALTER TABLE [dbo].[UserResults] CHECK CONSTRAINT [FK__UserResul__quest__628FA481]
GO
ALTER TABLE [dbo].[UserResults]  WITH CHECK ADD  CONSTRAINT [FK__UserResul__userI__619B8048] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserResults] CHECK CONSTRAINT [FK__UserResul__userI__619B8048]
GO
ALTER TABLE [dbo].[UserTests]  WITH CHECK ADD  CONSTRAINT [FK__UserTests__testI__1E6F845E] FOREIGN KEY([testId])
REFERENCES [dbo].[Tests] ([id])
GO
ALTER TABLE [dbo].[UserTests] CHECK CONSTRAINT [FK__UserTests__testI__1E6F845E]
GO
ALTER TABLE [dbo].[UserTests]  WITH CHECK ADD  CONSTRAINT [FK__UserTests__userI__1D7B6025] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserTests] CHECK CONSTRAINT [FK__UserTests__userI__1D7B6025]
GO
ALTER TABLE [dbo].[UserVocabulary]  WITH CHECK ADD  CONSTRAINT [FK__UserVocab__userI__5BE2A6F2] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserVocabulary] CHECK CONSTRAINT [FK__UserVocab__userI__5BE2A6F2]
GO
ALTER TABLE [dbo].[UserVocabulary]  WITH CHECK ADD FOREIGN KEY([vocabId])
REFERENCES [dbo].[Vocabulary] ([id])
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [CK__Messages__role__1AD3FDA4] CHECK  (([role]='model' OR [role]='user'))
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [CK__Messages__role__1AD3FDA4]
GO
USE [master]
GO
ALTER DATABASE [ChatbotToeic] SET  READ_WRITE 
GO
