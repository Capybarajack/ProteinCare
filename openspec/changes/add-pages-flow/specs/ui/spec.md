# Delta for UI

## ADDED Requirements

### Requirement: Four-page flow
The app SHALL provide four pages: Home, Upload, Analysis, Dashboard.

#### Scenario: Navigate between pages
- GIVEN the app is running
- WHEN the user clicks navigation links
- THEN the corresponding page is displayed

### Requirement: Upload → Analysis session
The system SHALL keep the selected image available when navigating from Upload to Analysis.

#### Scenario: Carry image to analysis
- GIVEN the user selected an image on Upload
- WHEN the user goes to Analysis
- THEN the image is shown on Analysis

### Requirement: Dashboard persistence
The system SHALL allow saving the current uploaded image to a dashboard list and persist it in localStorage.

#### Scenario: Save and reload
- GIVEN the user saves an upload to the dashboard
- WHEN the page is refreshed
- THEN the dashboard items remain
