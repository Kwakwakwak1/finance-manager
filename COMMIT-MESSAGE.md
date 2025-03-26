### MOST RECENT ON TOP. DO NOT DELETE PREVIOUS MESSAGES
## OBJECTIVE: create standard commit messages below: 
# fix(component.js)update buttons to work
# 
# - styled buttons
# - updated functionality to optimize as well 

## Begin:

fix(Dashboard.js): fix Manage Plans button navigation

- Updated button to use onClick instead of href
- Added setActiveTab prop to Dashboard component
- Ensured proper navigation to Plans & Goals section

fix(workflows): update Docker build workflow

- Fixed syntax error in GitHub Actions workflow
- Added step to convert repository owner to lowercase 
- Ensured Docker image builds and pushes on each code change
