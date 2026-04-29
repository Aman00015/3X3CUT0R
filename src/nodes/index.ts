import { CronTriggerNode } from './CronTriggerNode';
import { GitHubNode } from './GitHubNode';
import { ConditionNode } from './ConditionNode';
import { DelayNode } from './DelayNode';
import { TransformNode } from './TransformNode';

export { CronTriggerNode, GitHubNode, ConditionNode, DelayNode, TransformNode };

export const NODE_TYPES = {
  cron_trigger: CronTriggerNode,
  github: GitHubNode,
  condition: ConditionNode,
  delay: DelayNode,
  transform: TransformNode,
};
