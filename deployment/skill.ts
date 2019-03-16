import { App } from '@aws-cdk/cdk';
import { AlexaSkillStack } from 'taimos-cdk-constructs';

const app = new App();
// tslint:disable-next-line:no-unused-expression
new AlexaSkillStack(app, {
  skillName: 'pse-skill',
  skillId: 'amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794',
});
app.run();
