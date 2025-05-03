# CSV Import for Student Management

This document provides a guide for using the CSV import functionality in the AdminStudents page of the Pool Tracker application.

## Overview

The CSV import feature allows administrators and pedagogical team members (APE) to bulk import student records from a CSV file, streamlining the process of adding multiple students at once.

## CSV File Format

The CSV file should use semicolons (`;`) as separators and contain the following columns:

| Column Name | Description | Required |
|-------------|-------------|----------|
| `email` | Student email address (must be unique) | Yes |
| `firstname` or `first_name` | Student's first name | No |
| `lastname` or `last_name` | Student's last name | No |
| `team` or `team_name` | Team name to assign the student to | No |

## Example CSV Content

```
email;firstname;lastname;team
john.doe@epitech.eu;John;Doe;Red Team
jane.smith@epitech.eu;Jane;Smith;Blue Team
alex.johnson@epitech.eu;Alex;Johnson;Green Team
sarah.williams@epitech.eu;Sarah;Williams;Yellow Team
```

## Import Process

1. Navigate to the "Student Management" page
2. Click the "Import from CSV" button
3. Review the CSV format instructions displayed on screen
4. Click "Choose File" and select your CSV file
5. The system will validate the file and show any validation errors
6. Confirm the import when prompted
7. Wait for the import process to complete

## Validation Rules

The import process includes several validation checks:

- The CSV file must contain an `email` column
- Each email must be valid (contain `@` symbol)
- Each email must be unique in the system
- If a team is specified, it must already exist in the system
- CSV format must follow the expected structure

## Error Handling

If errors are detected during validation:
- A notification will display showing the number of errors
- Details of the first few errors will be shown
- You can proceed with importing valid entries even if some errors exist

## Team Assignment

When importing students:
- If a team name is provided and matches an existing team, the student will be assigned to that team
- Team names are case-insensitive (e.g., "Red Team" will match "red team")
- If a team name doesn't match any existing team, the student will be imported without team assignment
- You can later assign teams manually through the Teams management interface

## First Login Process

Imported students will need to set their passwords on first login:
1. Student visits the login page
2. Student enters their email address
3. Student checks the "First login (new student)" checkbox
4. The system will prompt the student to create a password

## Notes

- The bulk import feature is designed for initial setup or adding new batches of students
- For small numbers of students, the manual "Add a student" button may be more convenient
- Existing students with matching emails will not be overwritten
- The import only creates STUDENT role accounts; other roles must be created manually

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| CSV parsing errors | Ensure your file uses semicolons (`;`) as separators and is properly formatted |
| "Team not found" warnings | Verify team names match exactly with existing teams in the system |
| Email validation errors | Check that all email addresses are properly formatted |
| Import process too slow | Consider splitting large files into smaller batches |