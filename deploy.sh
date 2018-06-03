#!/usr/bin/env bash

export AWS_DEFAULT_REGION=eu-west-1
export AWS_REGION=eu-west-1
export AWS_DEFAULT_PROFILE=taimos
export AWS_PROFILE=taimos

set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STACK_NAME=pse-skill-04

deploySkill() {
    cd skill
    npm install
    npm test
    npm run build
    cd ..

    aws cloudformation package --template-file cfn.yaml --s3-bucket ${ACCOUNT_ID}-sam-deploy-${AWS_REGION} --s3-prefix ${STACK_NAME} --output-template-file cfn.packaged.yaml

    aws cloudformation deploy --template-file cfn.packaged.yaml --stack-name ${STACK_NAME} --capabilities CAPABILITY_IAM || echo "No Update"

    ARN=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey == 'SkillFunctionARN'].OutputValue" --output text)
    echo "Lambda is deployed as : ${ARN}"
}

deployModel() {
    SKILL_ID=amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794

    cd voice-interface
    npm install
    npm run start

    ask api update-model -s ${SKILL_ID} -l de-DE -f models/de-DE.json -p ${AWS_PROFILE}

    ask api get-skill-status -s ${SKILL_ID} -p ${AWS_PROFILE}

    until ask api get-skill-status -s ${SKILL_ID} -p ${AWS_PROFILE} | jp -u 'interactionModel."de-DE".lastUpdateRequest.status' | grep SUCCEEDED
    do
      echo "Waiting for model update to succeed"
      sleep 5
    done

    cd ..
}

deploySkill
deployModel
