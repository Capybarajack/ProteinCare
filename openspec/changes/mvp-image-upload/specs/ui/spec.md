# Delta for UI

## ADDED Requirements

### Requirement: Image Upload and Preview
The system SHALL allow the user to select an image file and preview it on the page.

#### Scenario: Upload via file picker
- GIVEN the user opens the page
- WHEN the user selects an image file
- THEN the app displays a preview of that image

#### Scenario: Upload via drag and drop
- GIVEN the user opens the page
- WHEN the user drags an image file onto the drop zone
- THEN the app displays a preview of that image

### Requirement: Basic validation
The system SHALL validate the uploaded file.

#### Scenario: Reject non-image
- GIVEN the user selects a non-image file
- THEN the app shows an error message and does not preview

#### Scenario: Reject too-large file
- GIVEN the user selects an image larger than the configured limit
- THEN the app shows an error message and does not preview
