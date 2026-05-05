# CSV Backend APIs

This backend stores contact and booking submissions in Excel-compatible CSV files.

## Required Packages

Install dependencies from the `backend` folder:

```bash
npm install
```

The CSV feature uses:

```bash
npm install csv-writer
```

## Run Server

```bash
cd backend
npm start
```

Server URL:

```text
http://localhost:5000
```

CSV files are created automatically in:

```text
backend/data/contact.csv
backend/data/booking.csv
```

## Contact API

Endpoint:

```text
POST /api/contact
```

Body:

```json
{
  "name": "Rahul Sharma",
  "phone": "+91 98765 43210",
  "message": "I want to know about hair styling."
}
```

CSV columns:

```text
Name,Phone,Message,Date
```

Example `contact.csv`:

```csv
Name,Phone,Message,Date
Rahul Sharma,+91 98765 43210,I want to know about hair styling.,2026-05-05T04:10:22.000Z
```

## Booking API

Endpoint:

```text
POST /api/booking
```

Body:

```json
{
  "name": "Priya Verma",
  "phone": "+91 91234 56789",
  "service": "Facial Treatments",
  "date": "2026-05-10",
  "time": "11:00"
}
```

CSV columns:

```text
Name,Phone,Service,Date,Time,CreatedAt
```

Example `booking.csv`:

```csv
Name,Phone,Service,Date,Time,CreatedAt
Priya Verma,+91 91234 56789,Facial Treatments,2026-05-10,11:00,2026-05-05T04:12:40.000Z
```

## Available Slots API

Endpoint:

```text
GET /api/booking/available-slots/2026-05-10
```

This reads `booking.csv` and removes booked times from the available slot list.
