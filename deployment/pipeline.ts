#!/usr/bin/env node
import {
  CloudFormationCapabilities,
  PipelineCreateReplaceChangeSetAction,
  PipelineExecuteChangeSetAction,
} from '@aws-cdk/aws-cloudformation';
import {GitHubSource, LinuxBuildImage, Project, S3BucketBuildArtifacts} from '@aws-cdk/aws-codebuild';
import {GitHubSourceAction, Pipeline} from '@aws-cdk/aws-codepipeline';
import {
  Action,
  ActionCategory,
  Artifact,
  CommonActionConstructProps,
  CommonActionProps,
} from '@aws-cdk/aws-codepipeline-api';
import {App, Construct, Secret, SecretParameter, Stack, StackProps} from '@aws-cdk/cdk';

interface AlexaSkillDeployActionProps extends CommonActionProps, CommonActionConstructProps {
  clientId : Secret;
  clientSecret : Secret;
  refreshToken : Secret;
  skillId : string;
  sourceArtifact : Artifact;
  overrideArtifact? : Artifact;
}

class AlexaSkillDeployAction extends Action {
  constructor(parent : Construct, id : string, props : AlexaSkillDeployActionProps) {
    super(parent, id, {
      stage: props.stage,
      runOrder: props.runOrder,
      artifactBounds: {
        minInputs: 0,
        maxInputs: 10,
        minOutputs: 0,
        maxOutputs: 1,
      },
      owner: 'ThirdParty',
      provider: 'AlexaSkillsKit',
      category: ActionCategory.Deploy,
      configuration: {
        ClientId: props.clientId,
        ClientSecret: props.clientSecret,
        RefreshToken: props.refreshToken,
        SkillId: props.skillId,
      },
    });
    this.addInputArtifact(props.sourceArtifact);
    if (props.overrideArtifact) {
      this.addInputArtifact(props.overrideArtifact);
    }
  }
}

class AlexaSkillPipelineStack extends Stack {
  constructor(parent : App, name : string, props? : StackProps) {
    super(parent, name, props);

    const pipeline = new Pipeline(this, 'Pipeline', {});

    // Source
    const sourceStage = pipeline.addStage('Source');

    const githubAccessToken = new SecretParameter(this, 'GithubToken', {ssmParameter: 'GithubToken'});
    new GitHubSourceAction(this, 'GitHubSource', {
      stage: sourceStage,
      owner: 'taimos',
      repo: 'pse-skill',
      oauthToken: githubAccessToken.value,
    });

    // Build
    const buildProject = new Project(this, 'BuildProject', {
      source: new GitHubSource({
        owner: 'taimos',
        repo: 'pse-skill',
        oauthToken: githubAccessToken.value,
      }),
      buildSpec: 'buildspec.yaml',
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_1_0,
        environmentVariables: {
          ARTIFACTS_BUCKET: {
            value: pipeline.artifactBucket.bucketName,
          },
        },
      },
      artifacts: new S3BucketBuildArtifacts({
        bucket: pipeline.artifactBucket,
        name: 'output.zip',
      }),
    });

    const buildStage = pipeline.addStage('Build');
    const buildAction = buildProject.addToPipeline(buildStage, 'CodeBuild', {});

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

    const clientId = new SecretParameter(this, 'AlexaClientId', {ssmParameter: '/Alexa/ClientId'});
    const clientSecret = new SecretParameter(this, 'AlexaClientSecret', {ssmParameter: '/Alexa/ClientSecret'});
    const refreshToken = new SecretParameter(this, 'AlexaRefreshToken', {ssmParameter: '/Alexa/RefreshToken'});
    new AlexaSkillDeployAction(this, 'DeploySkill', {
      stage: deployStage,
      runOrder: 3,
      sourceArtifact: buildAction.outputArtifact,
      overrideArtifact: executePipeline.outputArtifact,
      clientId: clientId.value,
      clientSecret: clientSecret.value,
      refreshToken: refreshToken.value,
      skillId: 'amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794',
    });

  }
}

const app = new App();
new AlexaSkillPipelineStack(app, 'pse-skill-pipeline');
app.run();
