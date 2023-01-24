#!/bin/bash

set -e

PROJECT_SLUG="github/$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

PARAMETERS_MAIN_WORKFLOW="false"
PARAMETERS_BETA_WORKFLOW="false"
PARAMETERS_FEATURE_BRANCH_WORKFLOW="false"
if [[ $CURRENT_BRANCH == "main" ]]; then
  PARAMETERS_MAIN_WORKFLOW="true"
elif [[ $CURRENT_BRANCH == "beta" ]]; then
  PARAMETERS_BETA_WORKFLOW="true"
else
  PARAMETERS_FEATURE_BRANCH_WORKFLOW="true"
fi

curl -X POST --header "Content-Type: application/json" --header "Circle-Token: $CIRCLE_TOKEN" -d "{
  \"branch\": \"$CURRENT_BRANCH\",
  \"parameters\": {
    \"setup\": false,
    \"main_workflow\": $PARAMETERS_MAIN_WORKFLOW,
    \"beta_workflow\": $PARAMETERS_BETA_WORKFLOW,
    \"feature_branch_workflow\": $PARAMETERS_FEATURE_BRANCH_WORKFLOW
  }
}" https://circleci.com/api/v2/project/$PROJECT_SLUG/pipeline
