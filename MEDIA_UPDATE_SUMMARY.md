# ✅ Media Support Update Summary

## 🎯 What Changed

Updated `question_test_service.js` to include **media files** (audio/image) for **Listening Parts (1, 2, 3, 4)**.

---

## 📝 Updated Functions

### 1. **`RandomQuestionsByTestId(testId, limit)`**

**Before:**
```javascript
const questions = await db.Question.findAll({
  where: { id: selectedIds },
  include: [
    { model: db.QuestionType, as: 'questionType' },
    { model: db.Part, as: 'part' }
  ],
});
```

**After:**
```javascript
const questions = await db.Question.findAll({
  where: { id: selectedIds },
  include: [
    { model: db.QuestionType, as: 'questionType' },
    { model: db.Part, as: 'part' },
    // ✅ NEW: Include media mappings
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

**Impact:** Questions now include `mediaMappings` array with audio/image data.

---

### 2. **`GetUserTestDetailById(userTestId)`**

**Before:**
```javascript
include: [{
  model: db.Question,
  attributes: ['question','optionA','optionB','optionC', 'optionD','correctAnswer', 'explanation','typeId','partId']
}]
```

**After:**
```javascript
include: [{
  model: db.Question,
  attributes: ['question','optionA','optionB','optionC', 'optionD','correctAnswer', 'explanation','typeId','partId'],
  // ✅ NEW: Include media
  include: [{
    model: db.QuestionMediaMap,
    as: 'mediaMappings',
    include: [{
      model: db.MediaFiles,
      as: 'media',
      attributes: ['id', 'mediaType', 'mediaUrl', 'description']
    }],
    attributes: ['id', 'mediaId', 'startSecond', 'endSecond', 'sortOrder']
  }]
}]
```

**Response Update:**
```javascript
details.push({
  // ... existing fields
  // ✅ NEW: Add media files
  mediaFiles: result.Question.mediaMappings?.map(mapping => ({
    id: mapping.media?.id,
    mediaType: mapping.media?.mediaType,
    mediaUrl: mapping.media?.mediaUrl,
    description: mapping.media?.description,
    startSecond: mapping.startSecond,
    endSecond: mapping.endSecond,
    sortOrder: mapping.sortOrder
  })) || []
});
```

**Impact:** User test results now include media URLs for review/playback.

---

## 🎧 Media Structure by Part

| Part | Name | Audio | Image |
|------|------|-------|-------|
| 1 | Photographs | ✅ | ✅ |
| 2 | Question-Response | ✅ | ❌ |
| 3 | Conversations | ✅ | ✅ (optional) |
| 4 | Talks | ✅ | ✅ (optional) |
| 5 | Incomplete Sentences | ❌ | ❌ |
| 6 | Text Completion | ❌ | ❌ |
| 7 | Reading Comprehension | ❌ | ❌ |

---

## 📊 Response Format

### Question with Media (Part 1 Example)
```json
{
  "id": 123,
  "question": "Look at the picture...",
  "optionA": "Walking",
  "optionB": "Sitting",
  "optionC": "Reading",
  "optionD": "Talking",
  "correctAnswer": "A",
  "partId": 1,
  "mediaMappings": [
    {
      "id": 45,
      "mediaId": 12,
      "sortOrder": 1,
      "startSecond": null,
      "endSecond": null,
      "media": {
        "id": 12,
        "mediaType": "image",
        "mediaUrl": "https://res.cloudinary.com/.../image.jpg",
        "description": "Question image"
      }
    },
    {
      "id": 46,
      "mediaId": 8,
      "sortOrder": 2,
      "startSecond": 0,
      "endSecond": 10,
      "media": {
        "id": 8,
        "mediaType": "audio",
        "mediaUrl": "https://res.cloudinary.com/.../audio.mp3",
        "description": "Question audio"
      }
    }
  ]
}
```

### Question without Media (Part 5 Example)
```json
{
  "id": 201,
  "question": "The company _____ to expand...",
  "optionA": "plans",
  "partId": 5,
  "mediaMappings": []  // Empty array
}
```

---

## 🔧 Frontend Integration Guide

### Check if Question has Media
```typescript
const hasAudio = question.mediaMappings?.some(m => m.media?.mediaType === 'audio');
const hasImage = question.mediaMappings?.some(m => m.media?.mediaType === 'image');
```

### Display Audio Player
```typescript
const audioMedia = question.mediaMappings?.find(m => m.media?.mediaType === 'audio');

{audioMedia && (
  <audio 
    controls 
    src={audioMedia.media.mediaUrl}
    preload="metadata"
  >
    Your browser does not support audio.
  </audio>
)}
```

### Display Image
```typescript
const imageMedia = question.mediaMappings?.find(m => m.media?.mediaType === 'image');

{imageMedia && (
  <img 
    src={imageMedia.media.mediaUrl} 
    alt={imageMedia.media.description || 'Question image'}
    style={{ maxWidth: '100%' }}
  />
)}
```

### Conditional Rendering by Part
```typescript
const isListeningPart = [1, 2, 3, 4].includes(question.partId);

{isListeningPart && audioMedia && (
  <AudioPlayer src={audioMedia.media.mediaUrl} />
)}
```

---

## ✅ Testing Checklist

- [ ] Test Part 1 (Photo + Audio)
- [ ] Test Part 2 (Audio only)
- [ ] Test Part 3 (Audio + Optional Image)
- [ ] Test Part 4 (Audio + Optional Image)
- [ ] Test Part 5-7 (No media - empty array)
- [ ] Check `mediaMappings` is array (not null)
- [ ] Check `mediaFiles` field in test results
- [ ] Verify audio plays correctly
- [ ] Verify images display correctly
- [ ] Check mobile responsiveness

---

## 📚 Related Documentation

- **`MEDIA_API_RESPONSE_FORMAT.md`** - Detailed API format guide
- **`ADDTESTFORM_USER_GUIDE.md`** - How to create tests with media
- **`PATH_AUTO_FORMAT_INFO.md`** - Auto-format paths for batch upload

---

## 🚀 Next Steps

### Backend ✅
- [x] Update `RandomQuestionsByTestId` to include media
- [x] Update `GetUserTestDetailById` to include media
- [ ] (Optional) Add media preloading endpoint
- [ ] (Optional) Add media caching strategy

### Frontend 🔄
- [ ] Update Question component to display media
- [ ] Add audio player component
- [ ] Add image viewer component
- [ ] Conditional rendering based on `partId`
- [ ] Handle media loading states
- [ ] Add error handling for failed media loads
- [ ] Test on mobile devices

---

## 💡 Tips

1. **Always check if `mediaMappings` exists before accessing**
   ```typescript
   const media = question.mediaMappings?.[0]?.media;
   ```

2. **Use optional chaining for safety**
   ```typescript
   const audioUrl = question.mediaMappings?.find(m => m.media?.mediaType === 'audio')?.media?.mediaUrl;
   ```

3. **Sort media by `sortOrder` if needed**
   ```typescript
   const sortedMedia = [...question.mediaMappings].sort((a, b) => a.sortOrder - b.sortOrder);
   ```

4. **Preload audio for better UX**
   ```html
   <audio preload="metadata" src={audioUrl} />
   ```

---

**Updated:** October 2025  
**Files Modified:** `question_test_service.js`  
**Status:** ✅ Backend Complete - Frontend Integration Pending
