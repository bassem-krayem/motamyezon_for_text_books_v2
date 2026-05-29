# File Upload Guide

## Table of Contents
- [Overview](#overview)
- [Supported Formats](#supported-formats)
- [Upload Requirements](#upload-requirements)
- [Upload Process](#upload-process)
- [Storage Details](#storage-details)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

The Motamyezon API supports uploading e-book files in three formats (EPUB, AZW3, KFX) when creating books. Files are uploaded to cloud storage (DigitalOcean Spaces S3) and URLs are returned in the response.

### Key Features
- **Multi-format support**: EPUB, AZW3, KFX
- **Secure upload**: Files validated on server side
- **Cloud storage**: Files stored on DigitalOcean Spaces
- **Public URLs**: Direct download links provided
- **File deletion**: Automatic cleanup when book is deleted

---

## Supported Formats

### EPUB
- **Full Name**: Electronic Publication
- **Extension**: `.epub`
- **Use Case**: Standard e-book format, widely supported
- **Max Size**: 50MB
- **Example**: `book.epub`

### AZW3
- **Full Name**: Amazon Kindle Format 8
- **Extension**: `.azw3`
- **Use Case**: Amazon Kindle and Kindle app
- **Max Size**: 50MB
- **Example**: `book.azw3`

### KFX
- **Full Name**: Amazon KFX format
- **Extension**: `.kfx`
- **Use Case**: Modern Amazon Kindle devices
- **Max Size**: 50MB
- **Example**: `book.kfx`

---

## Upload Requirements

### Mandatory Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| title | string | Book title | "The Mystery Novel" |
| description | string | Book description | "An engaging mystery" |
| author | string | Author ID (must exist) | "98765432" |
| categories | JSON array | Category IDs | ["11223344", "22334455"] |
| epub | file | EPUB file (required) | book.epub |
| azw3 | file | AZW3 file (required) | book.azw3 |
| kfx | file | KFX file (required) | book.kfx |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| series | string | Series ID (must exist if provided) | "55443322" |

### File Constraints

- **File Size**: Each file must be ≤ 50MB
- **Format**: Only EPUB, AZW3, KFX accepted
- **Quantity**: All three formats required (cannot upload partial set)
- **Names**: File names must have correct extensions

---

## Upload Process

### Step 1: Authenticate

You must be logged in with admin or uploader role to upload files.

```bash
# Login first
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'

# Extract token from response
# "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 2: Prepare Book Files

Ensure you have all three file formats ready:
- `book.epub` - EPUB version
- `book.azw3` - Kindle version
- `book.kfx` - Modern Kindle version

### Step 3: Send Upload Request

Use multipart/form-data to send files along with metadata:

```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=The Mystery Novel" \
  -F "description=An engaging mystery that keeps you guessing" \
  -F "author=98765432" \
  -F "series=55443322" \
  -F "categories=[\"11223344\", \"22334455\"]" \
  -F "epub=@/path/to/book.epub" \
  -F "azw3=@/path/to/book.azw3" \
  -F "kfx=@/path/to/book.kfx"
```

### Step 4: Handle Response

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "10001234",
    "title": "The Mystery Novel",
    "description": "An engaging mystery that keeps you guessing",
    "author": "98765432",
    "series": "55443322",
    "categories": ["11223344", "22334455"],
    "fileFormats": {
      "epub": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.epub",
      "azw3": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.azw3",
      "kfx": "https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.kfx"
    },
    "createdAt": "2024-01-20 14:30:00",
    "updatedAt": "2024-01-20 14:30:00"
  }
}
```

---

## Storage Details

### Cloud Provider

**Provider**: DigitalOcean Spaces (S3-compatible)

**Bucket**: `motamayezon`

**Region**: `lon1` (London)

**Base URL**: `https://lon1.digitaloceanspaces.com/`

### File Path Structure

Files are stored with the following path:
```
books/{bookId}.{extension}
```

**Examples:**
- `https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.epub`
- `https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.azw3`
- `https://lon1.digitaloceanspaces.com/motamayezon/books/10001234.kfx`

### Public Access

All uploaded files are **publicly accessible** via their URLs. URLs are:
- Permanent (won't change after initial upload)
- Directly downloadable
- Suitable for sharing

### File Retention

Files are retained as long as:
1. The book record exists in database
2. The book has not been deleted

When a book is deleted, all associated files are automatically removed from cloud storage.

---

## Error Handling

### Error: Missing Required Files

**Status**: 400 Bad Request

**Response**:
```json
{
  "status": "fail",
  "message": "All three file formats are required (epub, azw3, kfx)"
}
```

**Cause**: One or more file formats were not uploaded

**Solution**: Ensure all three formats are included in request

---

### Error: File Too Large

**Status**: 400 Bad Request

**Response**:
```json
{
  "status": "fail",
  "message": "File size exceeds 50MB limit"
}
```

**Cause**: Uploaded file exceeds 50MB size limit

**Solution**: Reduce file size or compress the e-book

---

### Error: Invalid File Type

**Status**: 400 Bad Request

**Response**:
```json
{
  "status": "fail",
  "message": "Only .epub, .azw3, and .kfx files are allowed"
}
```

**Cause**: File extension is not one of the supported formats

**Solution**: Ensure files have correct extensions (.epub, .azw3, .kfx)

---

### Error: Invalid Author

**Status**: 400 Bad Request

**Response**:
```json
{
  "status": "fail",
  "message": "Author with ID 99999999 does not exist"
}
```

**Cause**: Author ID provided doesn't exist in database

**Solution**: Use a valid author ID or create the author first

---

### Error: Invalid Category

**Status**: 400 Bad Request

**Response**:
```json
{
  "status": "fail",
  "message": "Category with ID 99999999 not found"
}
```

**Cause**: One or more category IDs don't exist

**Solution**: Verify all category IDs are valid

---

### Error: Invalid Series

**Status**: 400 Bad Request

**Response**:
```json
{
  "status": "fail",
  "message": "Series with ID 99999999 does not exist"
}
```

**Cause**: Series ID provided doesn't exist (if series field was provided)

**Solution**: Use a valid series ID or omit the series field

---

### Error: Missing Authentication

**Status**: 401 Unauthorized

**Response**:
```json
{
  "status": "fail",
  "message": "You are not logged in"
}
```

**Cause**: No authorization token provided

**Solution**: Login first and include token in Authorization header

---

### Error: Insufficient Permissions

**Status**: 403 Forbidden

**Response**:
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

**Cause**: User role is not admin or uploader

**Solution**: Request admin to upgrade your role or use appropriate account

---

## Examples

### Example 1: Upload with Required Fields Only

```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Simple Book" \
  -F "description=A simple book" \
  -F "author=98765432" \
  -F "categories=[\"11223344\"]" \
  -F "epub=@./books/simple.epub" \
  -F "azw3=@./books/simple.azw3" \
  -F "kfx=@./books/simple.kfx"
```

### Example 2: Upload with Series

```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Book 1 of Series" \
  -F "description=First book in the series" \
  -F "author=98765432" \
  -F "series=55443322" \
  -F "categories=[\"11223344\", \"22334455\"]" \
  -F "epub=@./books/book1.epub" \
  -F "azw3=@./books/book1.azw3" \
  -F "kfx=@./books/book1.kfx"
```

### Example 3: JavaScript/Node.js Upload

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uploadBook() {
  const form = new FormData();
  
  // Add form fields
  form.append('title', 'The Mystery Novel');
  form.append('description', 'An engaging mystery');
  form.append('author', '98765432');
  form.append('series', '55443322');
  form.append('categories', JSON.stringify(['11223344', '22334455']));
  
  // Add files
  form.append('epub', fs.createReadStream('./book.epub'));
  form.append('azw3', fs.createReadStream('./book.azw3'));
  form.append('kfx', fs.createReadStream('./book.kfx'));
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/books',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer YOUR_TOKEN`
        }
      }
    );
    
    console.log('Upload successful!');
    console.log('Book ID:', response.data.data.id);
    console.log('EPUB URL:', response.data.data.fileFormats.epub);
    console.log('AZW3 URL:', response.data.data.fileFormats.azw3);
    console.log('KFX URL:', response.data.data.fileFormats.kfx);
    
  } catch (error) {
    console.error('Upload failed:', error.response.data.message);
  }
}

uploadBook();
```

### Example 4: JavaScript/Browser Upload with Fetch API

```javascript
async function uploadBook(token, files, bookData) {
  const formData = new FormData();
  
  // Add form fields
  formData.append('title', bookData.title);
  formData.append('description', bookData.description);
  formData.append('author', bookData.author);
  formData.append('series', bookData.series);
  formData.append('categories', JSON.stringify(bookData.categories));
  
  // Add files (from file input elements)
  formData.append('epub', files.epub);
  formData.append('azw3', files.azw3);
  formData.append('kfx', files.kfx);
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/books', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    console.log('Book created:', result.data.id);
    return result.data;
    
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

// Usage with HTML form
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const files = {
    epub: form.querySelector('input[name="epub"]').files[0],
    azw3: form.querySelector('input[name="azw3"]').files[0],
    kfx: form.querySelector('input[name="kfx"]').files[0]
  };
  
  const bookData = {
    title: form.querySelector('input[name="title"]').value,
    description: form.querySelector('textarea[name="description"]').value,
    author: form.querySelector('select[name="author"]').value,
    series: form.querySelector('select[name="series"]').value,
    categories: Array.from(form.querySelectorAll('input[name="categories"]:checked'))
      .map(c => c.value)
  };
  
  const token = localStorage.getItem('token');
  await uploadBook(token, files, bookData);
});
```

### Example 5: Python Upload

```python
import requests

def upload_book(token, file_paths, book_data):
    """
    Upload a book with all three file formats
    
    Args:
        token: JWT authentication token
        file_paths: Dict with keys 'epub', 'azw3', 'kfx' pointing to file paths
        book_data: Dict with 'title', 'description', 'author', 'categories', etc.
    """
    url = 'http://localhost:3000/api/v1/books'
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Prepare files
    files = {
        'epub': open(file_paths['epub'], 'rb'),
        'azw3': open(file_paths['azw3'], 'rb'),
        'kfx': open(file_paths['kfx'], 'rb'),
    }
    
    # Prepare form data
    data = {
        'title': book_data['title'],
        'description': book_data['description'],
        'author': book_data['author'],
        'categories': str(book_data['categories']).replace("'", '"'),
    }
    
    if 'series' in book_data:
        data['series'] = book_data['series']
    
    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        
        result = response.json()
        print(f"Book created successfully!")
        print(f"Book ID: {result['data']['id']}")
        print(f"EPUB: {result['data']['fileFormats']['epub']}")
        print(f"AZW3: {result['data']['fileFormats']['azw3']}")
        print(f"KFX: {result['data']['fileFormats']['kfx']}")
        
        return result['data']
        
    except requests.exceptions.RequestException as e:
        error_data = e.response.json()
        print(f"Upload failed: {error_data['message']}")
        raise

# Usage
token = "YOUR_JWT_TOKEN"
file_paths = {
    'epub': './book.epub',
    'azw3': './book.azw3',
    'kfx': './book.kfx'
}
book_data = {
    'title': 'The Mystery Novel',
    'description': 'An engaging mystery',
    'author': '98765432',
    'series': '55443322',
    'categories': ['11223344', '22334455']
}

upload_book(token, file_paths, book_data)
```

---

## Best Practices

### For Users Uploading Files

1. **Validate Files Before Upload**
   - Ensure files have correct extensions
   - Check file sizes are under 50MB each
   - Test files work in their respective readers

2. **Use Descriptive Titles and Descriptions**
   - Help users find books easily
   - Include relevant keywords
   - Provide accurate descriptions

3. **Organize Files Consistently**
   - Use consistent naming patterns
   - Group related books together
   - Document file organization

4. **Verify Upload Success**
   - Check that all three formats are uploaded
   - Test download links from response
   - Verify book appears in catalog

5. **Monitor Upload Failures**
   - Read error messages carefully
   - Check file validity if upload fails
   - Verify author/series/category IDs exist

### For API Consumers

1. **Handle Partial Failures**
   - If one file fails, entire upload fails
   - Don't retry immediately (wait a moment)
   - Log failures for debugging

2. **Store File URLs**
   - URLs don't change after upload
   - Safe to store in database
   - Safe to distribute to end users

3. **Implement Progress Tracking**
   - Show upload progress for large files
   - Allow cancellation of uploads
   - Provide user feedback during upload

4. **Validate Before Sending**
   - Verify file types before upload
   - Check file sizes
   - Validate required fields
   - Verify IDs (author, series, categories) exist

5. **Retry Logic**
   - Implement exponential backoff for retries
   - Don't retry on 4xx errors (fix input first)
   - Retry on 5xx errors with backoff

---

## Troubleshooting

### Upload Hangs

**Problem**: Upload appears to be stuck or taking very long

**Solutions**:
1. Check file sizes (should be < 50MB each)
2. Check network connection stability
3. Try uploading with smaller files first
4. Check server logs for errors

### "Token expired" During Upload

**Problem**: Upload fails halfway with token error

**Solutions**:
1. Login again to get a fresh token
2. For large files, implement token refresh before upload
3. Use shorter token expiry for security, but handle refresh

### Files Uploaded but Book Not Created

**Problem**: Files appear uploaded but book record doesn't exist

**Solutions**:
1. Check response status code
2. Review error message in response
3. Verify author/category/series IDs are valid
4. Try again with valid IDs

---

See [API.md](API.md) for the complete book upload endpoint documentation.
