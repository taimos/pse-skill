#!/usr/bin/env node
import {AlexaSkillDeployAction} from '@aws-cdk/alexa-ask';
import {
  CloudFormationCapabilities,
  PipelineCreateReplaceChangeSetAction,
  PipelineExecuteChangeSetAction,
} from '@aws-cdk/aws-cloudformation';
import {LinuxBuildImage, Project, S3BucketBuildArtifacts} from '@aws-cdk/aws-codebuild';
import {GitHubSourceAction, Pipeline} from '@aws-cdk/aws-codepipeline';
import {SecretString} from '@aws-cdk/aws-secretsmanager';

import {App, Secret, Stack, StackProps} from '@aws-cdk/cdk';

class AlexaSkillPipelineStack extends Stack {
  constructor(parent : App, name : string, props? : StackProps) {
    super(parent, name, props);
    this.templateOptions.description = 'The deployment pipeline for the pse-skill';

    const pipeline = new Pipeline(this, 'Pipeline', {});

    // Source
    const sourceStage = pipeline.addStage('Source');

    const githubAccessToken = new SecretString(this, 'GithubToken', {secretId: 'GitHub'});
    const gitHubSourceAction = new GitHubSourceAction(this, 'GitHubSource', {
      stage: sourceStage,
      owner: 'taimos',
      repo: 'pse-skill',
      oauthToken: new Secret(githubAccessToken.jsonFieldValue('Token')),
    });

    // Build
    const buildProject = new Project(this, 'BuildProject', {
      buildSpec: {
        version: 0.2,
        phases: {
          install: {
            commands: ['pip install --upgrade awscli'],
          },
          pre_build: {
            commands: ['npm install --prefix skill/', 'npm install --prefix voice-interface/'],
          },
          build: {
            commands: [
              'npm test --prefix skill/',
              'npm run build --prefix skill/',
              'npm run start --prefix voice-interface/',
              `aws cloudformation package --template-file cfn.yaml --s3-bucket ${pipeline.artifactBucket.bucketName} --output-template-file cfn.packaged.yaml`,
            ],
          },
        },
        artifacts: {
          files: [
            'cfn.packaged.yaml',
            'interactionModel/*.json',
            'skill.json',
          ],
        },
      },
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
      },
      artifacts: new S3BucketBuildArtifacts({
        bucket: pipeline.artifactBucket,
        name: 'output.zip',
      }),
    });

    const buildStage = pipeline.addStage('Build');
    const buildAction = buildProject.addToPipeline(buildStage, 'CodeBuild', {
      inputArtifact: gitHubSourceAction.outputArtifact,
    });

    // Deploy
    const deployStage = pipeline.addStage('Deploy');
    const stackName = 'pse-skill';
    const changeSetName = 'StagedChangeSet';

    new PipelineCreateReplaceChangeSetAction(this, 'PrepareChangesTest', {
      stage: deployStage,
      runOrder: 1,
      stackName,
      changeSetName,
      adminPermissions: true,
      templatePath: buildAction.outputArtifact.atPath('cfn.packaged.yaml'),
      capabilities: CloudFormationCapabilities.NamedIAM,
    });

    const executePipeline = new PipelineExecuteChangeSetAction(this, 'ExecuteChangesTest', {
      stage: deployStage,
      runOrder: 2,
      stackName,
      changeSetName,
      outputFileName: 'overrides.json',
      outputArtifactName: 'CloudFormation',
    });

    const alexaSecrets = new SecretString(this, 'AlexaSecrets', {secretId: 'Alexa'});
    new AlexaSkillDeployAction(this, 'DeploySkill', {
      stage: deployStage,
      runOrder: 3,
      inputArtifact: buildAction.outputArtifact,
      parameterOverridesArtifact: executePipeline.outputArtifact,
      clientId: new Secret(alexaSecrets.jsonFieldValue('ClientId')),
      clientSecret: new Secret(alexaSecrets.jsonFieldValue('ClientSecret')),
      refreshToken: new Secret(alexaSecrets.jsonFieldValue('RefreshToken')),
      skillId: 'amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794',
    });

  }
}

const app = new App();
new AlexaSkillPipelineStack(app, 'pse-skill-pipeline');
app.run();
