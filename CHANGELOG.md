# Changelog

## Release 1.0.6

### Changed

- Changed permission 'cms' to 'writer'. Now the 'writer' permission is required
  to create and edit CMS pages.
- Localization changes is now part of the 'writer' permission.
- Removed heirs from political map (w/o timeline)
- Added heirs as option in the 'other Person' section in the 'Material Map'

### Bug Fixes

- Added scrollwheel support to slider component: Shift scolls 10 years and Ctrl
  scrolls 100 years.
- Slider now emits the new value instead of the event object.
- Fixed 'No data' message on material map when no data is available.
  - Created a Module system to add additional functionalities to single graphs.
  - Created a NoDataModule that displays a message when no data is available.
  - Removed TimelineTicks from MaterialMap and replaced it with a TickGraph
  - Added TimellineCreateMarks prop on TimelineSlideshowArea
- Fixed timeline delete and add and removed timeline labels (now as titles on
  hover).
- Properly separaterd writer and editor permissions.
