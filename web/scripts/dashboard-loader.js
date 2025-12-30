
let currentData = [];
    let recordCount = 0;
    let parentFieldCounter = 0;
    let uploadedPhotos = [];
    let voiceRecognition = null;
    let currentVoiceTarget = null;
document.addEventListener("DOMContentLoaded", () => {
  // Embedded JSON data

  const data = [
                 {
                   "type": "enrollment",
                   "title": "New Student Enrollment",
                   "description": "Enrolled Adil Shaik",
                   "date_of_joining": "2024-12-01",
                   "status": "enrolled",
                   "student_program": "preprimary1",
                   "student": {
                     "student_id" : "alwala_pp1_25_adsh",
                     "student_first_name": "Adil",
                     "student_last_name": "Shaik",
                     "student_dob": "2022-05-25",
                     "address": "House 21,  Alwala, Thirumalagir",
                     "contact": "9010541247",
                     "gender": "Male",
                     "student_social_category": "BC",
                      "guardians":  [
                       {
                         "name": "Mahamood",
                         "relationship": "father",
                         "contact": "9010541247",
                         "address": "",
                         "aadhaar": "",
                         "is_primary": true
                       },
                       {
                         "name": "Samreen",
                         "relationship": "mother",
                         "contact": "9010541247",
                         "address": "",
                         "aadhaar": "379603526834",
                         "is_primary": false
                       }
                     ]
                   },
                   "notes": "No allergies",
                   "created_at": "2025-11-05T07:43:45.272Z"
                 },
                 {
                   "type": "enrollment",
                   "title": "New Student Enrollment",
                   "description": "Enrolled Bharath Nallabothu",
                   "date_of_joining": "2025-09-01T07:50:05.658Z",
                   "status": "enrolled",
                   "student_program": "playgroup",
                   "student": {
                   "student_id" : "alwala_pg_25_bhna",
                     "student_first_name": "Bharath",
                     "student_last_name": "Nallabothu",
                     "student_dob": "2023-02-17",
                     "address": "House12, Alwala ",
                     "contact": "8688275103",
                     "gender": "Male",
                     "student_social_category": "General",
                   "guardians": [
                       {
                         "name": "Govind",
                         "relationship": "father",
                         "contact": "8688275103",
                         "address": "",
                         "aadhaar": "",
                         "is_primary": true
                       },
                       {
                         "name": "Laxmi",
                         "relationship": "mother",
                         "contact": "8688275103",
                         "address": "",
                         "aadhaar": "406253751347",
                         "is_primary": false
                       }
                     ]
                   },
                   "notes": "No allergies",
                   "created_at": "2025-11-05T07:50:05.658Z"
                 }
               ];

const evaluations = [
  {
    "type": "evaluation",
    "title": "Monthly Learning Evaluation",
    "student_id": "alwala_pp1_25_adsh",
    "program_id": "preprimary1",
    "month": "2025-11",
    "objectives": [
      {
        "objective": "Creative arts",
        "status": "achieved",
        "remarks": "Adil enjoys painting and crafts"
      },
      {
        "objective": "Early literacy",
        "status": "in-progress",
        "remarks": "Recognizes letters A–F, needs practice with G–Z"
      },
      {
        "objective": "Number recognition",
        "status": "achieved",
        "remarks": "Can count up to 20 confidently"
      }
    ],
    "overall_feedback": "Adil is progressing well, especially in numeracy",
    "evaluated_by": "Teacher Anjali",
    "evaluation_date": "2025-11-20T10:30:00Z"
  },
  {
    "type": "evaluation",
    "title": "Monthly Learning Evaluation",
    "student_id": "alwala_pg_25_bhna",
    "program_id": "playgroup",
    "month": "2025-11",
    "objectives": [
      {
        "objective": "Sensory play",
        "status": "achieved",
        "remarks": "Bharath engages actively in tactile activities"
      },
      {
        "objective": "Basic social skills",
        "status": "in-progress",
        "remarks": "Plays well with peers but needs guidance in sharing"
      },
      {
        "objective": "Music and movement",
        "status": "achieved",
        "remarks": "Participates enthusiastically in group songs"
      }
    ],
    "overall_feedback": "Bharath is socially improving, strong in music activities",
    "evaluated_by": "Teacher Kavitha",
    "evaluation_date": "2025-11-20T11:00:00Z"
  }
];

currentData = data;
 recordCount = data.length;
 renderActivitiesList(data);
  updateStats(data);
 updateStudentCount(data);
});

