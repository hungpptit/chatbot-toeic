# 📚 Media API Response Format - TOEIC Chatbot

## 🎯 Tổng quan

Các API trả về questions cho **Listening Parts (1, 2, 3, 4)** sẽ bao gồm **media files** (audio/image).

## 📊 Database Schema

### Tables liên quan:

```
Questions
├── id (PK)
├── question
├── optionA, optionB, optionC, optionD
├── correctAnswer
├── partId (FK → Parts)
└── typeId (FK → QuestionTypes)

MediaFiles
├── id (PK)
├── mediaType (ENUM: 'image', 'audio', 'video')
├── mediaUrl (Cloudinary URL)
└── description

QuestionMediaMap (Junction Table)
├── id (PK)
├── questionId (FK → Questions)
├── mediaId (FK → MediaFiles)
├── startSecond (nullable - for audio segments)
├── endSecond (nullable - for audio segments)
└── sortOrder (nullable - order of media in question)
```

### Relationships:

```
Question ──(1:N)→ QuestionMediaMap ──(N:1)→ MediaFiles
```

- 1 Question có thể có nhiều media (ví dụ: Part 1 có 1 image, Part 3 có 1 audio + 1 image)
- 1 MediaFile có thể dùng cho nhiều questions (reuse)

---

## 🔧 API Updates

### 1. `RandomQuestionsByTestId(testId, limit)`

**Purpose:** Lấy random questions cho test (dùng khi user làm bài)

**Updated Include:**
```javascript
const questions = await db.Question.findAll({
  where: { id: selectedIds },
  include: [
    { model: db.QuestionType, as: 'questionType' },
    { model: db.Part, as: 'part' },
    // ✅ Include media
    {
      model: db.QuestionMediaMap,
      as: 'mediaMappings',
      include: [{
        model: db.MediaFiles,
        as: 'media',
        attributes: ['id', 'mediaType', 'mediaUrl', 'description']
      }],
      attributes: ['id', 'mediaId', 'startSecond', 'endSecond', 'sortOrder']
    }
  ],
});
```

**Response Format:**
```json
[
  {
    "id": 123,
    "question": "Look at the picture. What is the man doing?",
    "optionA": "Walking",
    "optionB": "Sitting",
    "optionC": "Reading",
    "optionD": "Talking",
    "correctAnswer": "A",
    "explanation": "...",
    "typeId": 1,
    "partId": 1,
    "questionType": {
      "id": 1,
      "name": "Single Picture"
    },
    "part": {
      "id": 1,
      "name": "Part 1 - Photographs"
    },
    "mediaMappings": [
      {
        "id": 45,
        "mediaId": 12,
        "startSecond": null,
        "endSecond": null,
        "sortOrder": 1,
        "media": {
          "id": 12,
          "mediaType": "image",
          "mediaUrl": "https://res.cloudinary.com/.../image.jpg",
          "description": "Part 1 question image"
        }
      },
      {
        "id": 46,
        "mediaId": 8,
        "startSecond": 0,
        "endSecond": 10,
        "sortOrder": 2,
        "media": {
          "id": 8,
          "mediaType": "audio",
          "mediaUrl": "https://res.cloudinary.com/.../audio.mp3",
          "description": "Part 1 audio"
        }
      }
    ]
  }
]
```

---

### 2. `GetUserTestDetailById(userTestId)`

**Purpose:** Lấy chi tiết bài làm của user (sau khi submit)

**Updated Include:**
```javascript
const userResults = await db.UserResult.findAll({
  where: { userTestId },
  include: [{
    model: db.Question,
    include: [{
      model: db.QuestionMediaMap,
      as: 'mediaMappings',
      include: [{
        model: db.MediaFiles,
        as: 'media'
      }]
    }]
  }]
});
```

**Response Format:**
```json
{
  "totalQuestions": 40,
  "correctCount": 35,
  "incorrectCount": 5,
  "skippedCount": 0,
  "details": [
    {
      "questionId": 123,
      "question": "Look at the picture...",
      "optionA": "Walking",
      "optionB": "Sitting",
      "optionC": "Reading",
      "optionD": "Talking",
      "typeId": 1,
      "partId": 1,
      "selectedOption": "A",
      "isCorrect": true,
      "correctAnswer": "A",
      "explanation": "...",
      "answeredAt": "2025-10-01T10:30:00Z",
      "mediaFiles": [
        {
          "id": 12,
          "mediaType": "image",
          "mediaUrl": "https://res.cloudinary.com/.../image.jpg",
          "description": "Question image",
          "startSecond": null,
          "endSecond": null,
          "sortOrder": 1
        },
        {
          "id": 8,
          "mediaType": "audio",
          "mediaUrl": "https://res.cloudinary.com/.../audio.mp3",
          "description": "Question audio",
          "startSecond": 0,
          "endSecond": 10,
          "sortOrder": 2
        }
      ]
    }
  ]
}
```

---

## 🎧 Listening Parts Media Structure

### Part 1 - Photographs
**Media:** 1 image + optional audio
```json
{
  "partId": 1,
  "mediaMappings": [
    {
      "media": {
        "mediaType": "image",
        "mediaUrl": "https://..."
      }
    },
    {
      "media": {
        "mediaType": "audio",
        "mediaUrl": "https://...",
        "startSecond": 0,
        "endSecond": 10
      }
    }
  ]
}
```

### Part 2 - Question-Response
**Media:** 1 audio (no image)
```json
{
  "partId": 2,
  "mediaMappings": [
    {
      "media": {
        "mediaType": "audio",
        "mediaUrl": "https://...",
        "startSecond": 10,
        "endSecond": 15
      }
    }
  ]
}
```

### Part 3 - Conversations
**Media:** 1 audio + optional image (graph/table)
```json
{
  "partId": 3,
  "mediaMappings": [
    {
      "media": {
        "mediaType": "audio",
        "mediaUrl": "https://...",
        "startSecond": 0,
        "endSecond": 30
      }
    },
    {
      "media": {
        "mediaType": "image",
        "mediaUrl": "https://..." // Optional graph/table
      }
    }
  ]
}
```

### Part 4 - Talks
**Media:** 1 audio + optional image
```json
{
  "partId": 4,
  "mediaMappings": [
    {
      "media": {
        "mediaType": "audio",
        "mediaUrl": "https://...",
        "startSecond": 0,
        "endSecond": 45
      }
    }
  ]
}
```

### Part 5, 6, 7 - Reading
**Media:** None (no media needed)
```json
{
  "partId": 5,
  "mediaMappings": []  // Empty array
}
```

---

## 🔍 Frontend Integration

### 1. Display Media in Question Component

**React Example:**
```typescript
interface Question {
  id: number;
  question: string;
  // ... other fields
  mediaMappings?: Array<{
    media: {
      mediaType: 'image' | 'audio' | 'video';
      mediaUrl: string;
      description?: string;
    };
    startSecond?: number;
    endSecond?: number;
    sortOrder: number;
  }>;
}

const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  // Find audio
  const audioMedia = question.mediaMappings?.find(
    m => m.media.mediaType === 'audio'
  );
  
  // Find image
  const imageMedia = question.mediaMappings?.find(
    m => m.media.mediaType === 'image'
  );

  return (
    <div className="question-card">
      {/* Display audio player for Parts 1-4 */}
      {audioMedia && (
        <audio 
          controls 
          src={audioMedia.media.mediaUrl}
          preload="metadata"
        />
      )}
      
      {/* Display image for Part 1, 3 */}
      {imageMedia && (
        <img 
          src={imageMedia.media.mediaUrl} 
          alt={imageMedia.media.description || 'Question image'}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
      
      {/* Question text */}
      <h3>{question.question}</h3>
      
      {/* Options */}
      {/* ... */}
    </div>
  );
};
```

### 2. Conditional Rendering Based on Part

```typescript
const shouldShowAudio = (partId: number) => {
  return [1, 2, 3, 4].includes(partId); // Listening parts
};

const shouldShowImage = (partId: number) => {
  return [1, 3].includes(partId); // Part 1 (photos) & Part 3 (optional graphs)
};

// Usage
{shouldShowAudio(question.partId) && audioMedia && (
  <audio controls src={audioMedia.media.mediaUrl} />
)}

{shouldShowImage(question.partId) && imageMedia && (
  <img src={imageMedia.media.mediaUrl} alt="Question visual" />
)}
```

---

## 📋 API Response Examples

### Example 1: Part 1 Question (Photo + Audio)
```json
{
  "id": 101,
  "question": "Look at the picture marked number 1 in your test book.",
  "optionA": "He's walking down the street",
  "optionB": "He's sitting at a desk",
  "optionC": "He's reading a newspaper",
  "optionD": "He's talking on the phone",
  "correctAnswer": "A",
  "partId": 1,
  "mediaMappings": [
    {
      "sortOrder": 1,
      "media": {
        "id": 45,
        "mediaType": "image",
        "mediaUrl": "https://res.cloudinary.com/demo/image/upload/v1/toeic-test/part1-q1.jpg",
        "description": "Man walking on street"
      }
    },
    {
      "sortOrder": 2,
      "startSecond": 0,
      "endSecond": 8,
      "media": {
        "id": 78,
        "mediaType": "audio",
        "mediaUrl": "https://res.cloudinary.com/demo/video/upload/v1/toeic-test/part1-audio.mp3",
        "description": "Part 1 question audio"
      }
    }
  ]
}
```

### Example 2: Part 5 Question (No Media)
```json
{
  "id": 201,
  "question": "The company _____ to expand its operations next year.",
  "optionA": "plans",
  "optionB": "planning",
  "optionC": "planned",
  "optionD": "to plan",
  "correctAnswer": "A",
  "partId": 5,
  "mediaMappings": []  // Empty - no media for reading parts
}
```

---

## ✅ Benefits

1. **Flexible:** Support multiple media per question
2. **Reusable:** Same media can be used across questions
3. **Efficient:** Only fetch media when needed
4. **Scalable:** Easy to add video support later
5. **Clean:** Separate concerns (questions vs media)

---

## 🚀 Migration Notes

If you have existing questions without media:
- `mediaMappings` will be an empty array `[]`
- Frontend should handle gracefully (no errors)
- Gradually add media for listening parts

---

**Last Updated:** October 2025  
**Status:** ✅ Production Ready
