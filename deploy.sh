#!/usr/bin/env bash

export AWS_DEFAULT_REGION=eu-west-1
export AWS_REGION=eu-west-1
export AWS_DEFAULT_PROFILE=taimos
export AWS_PROFILE=taimos

set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STACK_NAME=pse-skill-04
SKILL_ID=amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794

checkSkill() {
    ARN=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey == 'SkillFunctionARN'].OutputValue" --output text || echo '')
    LIVEARN=$(ask api get-skill -s ${SKILL_ID} -p ${AWS_PROFILE} --stage live | jq -r '.manifest.apis.custom.endpoint.uri')

    if [ "${ARN}" == "${LIVEARN}" ]; then
       echo ${LIVEARN}
       echo "Deployment target ist live; Please change stack version"
       exit 1
    fi

    echo "Continue deployment"
}

deploySkill() {
    cd skill
    npm install
    npm test
    npm run build
    cd ..

    aws cloudformation package --template-file cfn.yaml --s3-bucket ${ACCOUNT_ID}-sam-deploy-${AWS_REGION} --s3-prefix ${STACK_NAME} --output-template-file cfn.packaged.yaml

    aws cloudformation deploy --template-file cfn.packaged.yaml --stack-name ${STACK_NAME} --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset

    ARN=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey == 'SkillFunctionARN'].OutputValue" --output text)
    echo "Lambda is deployed as : ${ARN}"
}

deployModel() {
    cd voice-interface

    ARN=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey == 'SkillFunctionARN'].OutputValue" --output text)
    ask api get-skill -s ${SKILL_ID} -p ${AWS_PROFILE} | jq ".manifest.apis.custom.endpoint.uri = \"${ARN}\"" > ~manifest.json

    ask api update-skill -s ${SKILL_ID} -f ~manifest.json -p ${AWS_PROFILE}

    until ask api get-skill-status -s ${SKILL_ID} -p ${AWS_PROFILE} | jq -r '.manifest.lastUpdateRequest.status' | grep SUCCEEDED
    do
      echo "Waiting for manifest update to succeed"
      sleep 5
    done

    rm -f ~manifest.json

    npm install
    npm run start

    ask api update-model -s ${SKILL_ID} -l de-DE -f models/de-DE.json -p ${AWS_PROFILE}

    until ask api get-skill-status -s ${SKILL_ID} -p ${AWS_PROFILE} | jq -r '.interactionModel."de-DE".lastUpdateRequest.status' | grep SUCCEEDED
    do
      echo "Waiting for model update to succeed"
      sleep 5
    done

    cd ..
}

checkSkill
deploySkill
deployModel
