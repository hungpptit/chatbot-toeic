# 🎯 Frontend Media Helper Functions Guide

## 📚 Overview

Updated `question_test_services.ts` với:
- ✅ TypeScript interfaces cho media
- ✅ Helper functions để xử lý media
- ✅ Console logging để debug

---

## 🔧 New Interfaces

### `MediaFile`
```typescript
interface MediaFile {
  id: number;
  mediaType: 'image' | 'audio' | 'video';
  mediaUrl: string;
  description?: string;
}
```

### `MediaMapping`
```typescript
interface MediaMapping {
  id: number;
  mediaId: number;
  startSecond?: number | null;
  endSecond?: number | null;
  sortOrder: number;
  media?: MediaFile;
}
```

### `Question` (Updated)
```typescript
interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  typeId: number;
  partId: number;
  
  // ✅ NEW: Media support
  mediaMappings?: MediaMapping[];
}
```

---

## 🛠️ Helper Functions

### 1. **`hasAudio(question)`**
Check if question has audio media.

```typescript
import { hasAudio } from '@/services/question_test_services';

const question = { /* ... */ };

if (hasAudio(question)) {
  console.log('This question has audio');
}
```

---

### 2. **`hasImage(question)`**
Check if question has image media.

```typescript
import { hasImage } from '@/services/question_test_services';

if (hasImage(question)) {
  console.log('This question has image');
}
```

---

### 3. **`getAudioMedia(question)`**
Get audio media object from question.

```typescript
import { getAudioMedia } from '@/services/question_test_services';

const audioMedia = getAudioMedia(question);

if (audioMedia) {
  const audioUrl = audioMedia.media?.mediaUrl;
  console.log('Audio URL:', audioUrl);
}
```

**Returns:**
```typescript
{
  id: 46,
  mediaId: 8,
  startSecond: 0,
  endSecond: 10,
  sortOrder: 2,
  media: {
    id: 8,
    mediaType: "audio",
    mediaUrl: "https://res.cloudinary.com/.../audio.mp3",
    description: "Question audio"
  }
}
```

---

### 4. **`getImageMedia(question)`**
Get image media object from question.

```typescript
import { getImageMedia } from '@/services/question_test_services';

const imageMedia = getImageMedia(question);

if (imageMedia) {
  const imageUrl = imageMedia.media?.mediaUrl;
  console.log('Image URL:', imageUrl);
}
```

---

### 5. **`getSortedMedia(question)`**
Get all media sorted by `sortOrder`.

```typescript
import { getSortedMedia } from '@/services/question_test_services';

const allMedia = getSortedMedia(question);

allMedia.forEach(mapping => {
  console.log(`${mapping.media?.mediaType}: ${mapping.media?.mediaUrl}`);
});
```

**Returns:**
```typescript
[
  {
    sortOrder: 1,
    media: { mediaType: "image", mediaUrl: "..." }
  },
  {
    sortOrder: 2,
    media: { mediaType: "audio", mediaUrl: "..." }
  }
]
```

---

### 6. **`isListeningPart(partId)`**
Check if part is a listening part (1, 2, 3, 4).

```typescript
import { isListeningPart } from '@/services/question_test_services';

if (isListeningPart(question.partId)) {
  console.log('This is a listening question');
  // Show audio player
}
```

---

### 7. **`partHasImages(partId)`**
Check if part typically has images (Part 1, 3).

```typescript
import { partHasImages } from '@/services/question_test_services';

if (partHasImages(question.partId)) {
  console.log('This part may have images');
  // Show image viewer
}
```

---

## 🎨 Usage Examples

### Example 1: Display Audio Player

```typescript
import { hasAudio, getAudioMedia } from '@/services/question_test_services';

const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  const audioMedia = getAudioMedia(question);

  return (
    <div className="question-card">
      {/* Show audio player if has audio */}
      {hasAudio(question) && audioMedia && (
        <div className="audio-section">
          <audio 
            controls 
            src={audioMedia.media?.mediaUrl}
            preload="metadata"
          >
            Your browser does not support audio.
          </audio>
          {audioMedia.media?.description && (
            <p className="audio-description">{audioMedia.media.description}</p>
          )}
        </div>
      )}
      
      {/* Question content */}
      <h3>{question.question}</h3>
      {/* ... options */}
    </div>
  );
};
```

---

### Example 2: Display Image

```typescript
import { hasImage, getImageMedia } from '@/services/question_test_services';

const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  const imageMedia = getImageMedia(question);

  return (
    <div className="question-card">
      {/* Show image if has image */}
      {hasImage(question) && imageMedia && (
        <div className="image-section">
          <img 
            src={imageMedia.media?.mediaUrl} 
            alt={imageMedia.media?.description || 'Question image'}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}
      
      <h3>{question.question}</h3>
      {/* ... */}
    </div>
  );
};
```

---

### Example 3: Conditional Rendering by Part

```typescript
import { 
  isListeningPart, 
  partHasImages,
  getAudioMedia,
  getImageMedia 
} from '@/services/question_test_services';

const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  const audioMedia = getAudioMedia(question);
  const imageMedia = getImageMedia(question);

  return (
    <div className="question-card">
      {/* Audio for listening parts (1-4) */}
      {isListeningPart(question.partId) && audioMedia && (
        <AudioPlayer src={audioMedia.media?.mediaUrl} />
      )}
      
      {/* Image for parts that typically have images (1, 3) */}
      {partHasImages(question.partId) && imageMedia && (
        <img src={imageMedia.media?.mediaUrl} alt="Question visual" />
      )}
      
      <h3>{question.question}</h3>
      {/* ... */}
    </div>
  );
};
```

---

### Example 4: Display All Media

```typescript
import { getSortedMedia } from '@/services/question_test_services';

const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  const allMedia = getSortedMedia(question);

  return (
    <div className="question-card">
      {/* Display all media in order */}
      {allMedia.map((mapping, index) => (
        <div key={mapping.id} className="media-item">
          {mapping.media?.mediaType === 'audio' && (
            <audio 
              controls 
              src={mapping.media.mediaUrl}
              preload="metadata"
            />
          )}
          
          {mapping.media?.mediaType === 'image' && (
            <img 
              src={mapping.media.mediaUrl} 
              alt={mapping.media.description || `Media ${index + 1}`}
            />
          )}
        </div>
      ))}
      
      <h3>{question.question}</h3>
      {/* ... */}
    </div>
  );
};
```

---

### Example 5: Safe Access with Optional Chaining

```typescript
const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  // ✅ Safe: Returns undefined if no audio
  const audioUrl = getAudioMedia(question)?.media?.mediaUrl;
  
  // ✅ Safe: Returns false if mediaMappings is undefined
  const showAudio = hasAudio(question);
  
  // ✅ Safe: Returns empty array if no media
  const allMedia = getSortedMedia(question);

  return (
    <div>
      {audioUrl && <audio controls src={audioUrl} />}
      {showAudio && <p>This question has audio</p>}
      <p>Total media: {allMedia.length}</p>
    </div>
  );
};
```

---

## 🐛 Debug Console Logs

When you call `getQuestionsByTestIdAPI(testId)`, you'll see:

```console
🔍 getQuestionsByTestIdAPI - Full Response: { data: [...], status: 200, ... }
📊 getQuestionsByTestIdAPI - Data: [{ id: 1, question: "...", ... }]
📝 getQuestionsByTestIdAPI - First Question: { id: 1, question: "...", mediaMappings: [...] }
🎵 getQuestionsByTestIdAPI - First Question Media: [{ id: 45, mediaId: 12, ... }]
🎧 Media Details:
  [0] image: https://res.cloudinary.com/.../image.jpg
  [1] audio: https://res.cloudinary.com/.../audio.mp3
```

**Use this to verify:**
- ✅ Media is being fetched from backend
- ✅ Media URLs are correct
- ✅ Media types are correct (image/audio)

---

## 📋 Checklist

### When displaying questions:

- [ ] Check if `isListeningPart(partId)` before showing audio
- [ ] Use `hasAudio(question)` to conditionally render audio player
- [ ] Use `hasImage(question)` to conditionally render image
- [ ] Use `getAudioMedia()` to get audio URL
- [ ] Use `getImageMedia()` to get image URL
- [ ] Handle cases where `mediaMappings` is undefined or empty
- [ ] Add loading states for media
- [ ] Add error handling for failed media loads

### Example Component Structure:

```typescript
const QuestionCard = ({ question }: { question: Question }) => {
  // 1. Get media
  const audioMedia = getAudioMedia(question);
  const imageMedia = getImageMedia(question);
  
  // 2. Check conditions
  const showAudio = isListeningPart(question.partId) && hasAudio(question);
  const showImage = partHasImages(question.partId) && hasImage(question);
  
  // 3. Render
  return (
    <div>
      {showAudio && <AudioPlayer url={audioMedia?.media?.mediaUrl} />}
      {showImage && <ImageViewer url={imageMedia?.media?.mediaUrl} />}
      <QuestionContent question={question} />
    </div>
  );
};
```

---

## 💡 Best Practices

1. **Always use helper functions** instead of accessing `mediaMappings` directly
   ```typescript
   // ❌ DON'T
   const hasAudio = question.mediaMappings?.find(m => m.media?.mediaType === 'audio');
   
   // ✅ DO
   const hasAudio = getAudioMedia(question);
   ```

2. **Check part type before showing media**
   ```typescript
   // ✅ Only show audio for listening parts
   {isListeningPart(question.partId) && <AudioPlayer />}
   ```

3. **Handle undefined/null gracefully**
   ```typescript
   const audioUrl = getAudioMedia(question)?.media?.mediaUrl || '';
   ```

4. **Sort media when displaying multiple**
   ```typescript
   const sortedMedia = getSortedMedia(question);
   ```

---

## 🚀 Next Steps

1. Update Question display components to use helpers
2. Add audio player component
3. Add image viewer component
4. Test with Part 1-4 questions (listening)
5. Test with Part 5-7 questions (no media)

---

**Updated:** October 2025  
**File:** `question_test_services.ts`  
**Status:** ✅ Ready for Frontend Integration
