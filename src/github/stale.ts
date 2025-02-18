import { Component } from '../component';
import { GitHub } from './github';
import { renderBehavior } from './stale-util';
import { JobPermission } from './workflows-model';

/**
 * Options for `Stale`.
 */
export interface StaleOptions {
  /**
   * How to handle stale pull requests.
   *
   * @default - By default, pull requests with no activity will be marked as
   * stale after 14 days and closed within 2 days with relevant comments.
   */
  readonly pullRequest?: StaleBehavior;

  /**
   * How to handle stale issues.
   *
   * @default - By default, stale issues with no activity will be marked as
   * stale after 60 days and closed within 7 days.
   */
  readonly issues?: StaleBehavior;

  /**
   * Github Runner selection labels
   * @default ["ubuntu-latest"]
   */
  readonly runsOn?: string[];
}

/**
 * Stale behavior.
 */
export interface StaleBehavior {
  /**
   * Determines if this behavior is enabled.
   *
   * Same as setting `daysBeforeStale` and `daysBeforeClose` to `-1`.
   *
   * @default true
   */
  readonly enabled?: boolean;

  /**
   * How many days until the issue or pull request is marked as "Stale". Set to -1 to disable.
   * @default -
   */
  readonly daysBeforeStale?: number;

  /**
   * Days until the issue/PR is closed after it is marked as "Stale". Set to -1 to disable.
   * @default -
   */
  readonly daysBeforeClose?: number;

  /**
   * The comment to add to the issue/PR when it becomes stale.
   * @default "This pull request is now marked as stale because hasn\'t seen activity for a while. Add a comment or it will be closed soon."
   */
  readonly staleMessage?: string;

  /**
   * The comment to add to the issue/PR when it's closed
   *
   * @default "Closing this pull request as it hasn\'t seen activity for a while. Please add a comment @mentioning a maintainer when you are ready to continue."
   */
  readonly closeMessage?: string;

  /**
   * The label to apply to the issue/PR when it becomes stale.
   * @default "Stale"
   */
  readonly staleLabel?: string;
}

/**
 * Warns and then closes issues and PRs that have had no activity for a specified amount of time.
 *
 * The default configuration will:
 *
 *  * Add a "Stale" label to pull requests after 14 days and closed after 2 days
 *  * Add a "Stale" label to issues after 60 days and closed after 7 days
 *  * If a comment is added, the label will be removed and timer is restarted.
 *
 * @see https://github.com/actions/stale
 */
export class Stale extends Component {
  constructor(github: GitHub, options: StaleOptions = {}) {
    super(github.project);

    const stale = github.addWorkflow('stale');
    stale.on({
      schedule: [{ cron: '0 1 * * *' }], // at 1am every day
      workflowDispatch: {},
    });

    const pullRequests = renderBehavior(options.pullRequest, { stale: 14, close: 2, type: 'pull request' });
    const issues = renderBehavior(options.issues, { stale: 60, close: 7, type: 'issue' });

    stale.addJobs({
      stale: {
        runsOn: options.runsOn ?? ['ubuntu-latest'],
        permissions: {
          issues: JobPermission.WRITE,
          pullRequests: JobPermission.WRITE,
        },
        steps: [
          {
            uses: 'actions/stale@v4',
            with: {
              // disable global
              'days-before-stale': -1,
              'days-before-close': -1,

              // pull requests
              'days-before-pr-stale': pullRequests.daysBeforeStale,
              'days-before-pr-close': pullRequests.daysBeforeClose,
              'stale-pr-message': pullRequests.staleMessage,
              'close-pr-message': pullRequests.closeMessage,
              'stale-pr-label': pullRequests.staleLabel,

              // issues
              'days-before-issue-stale': issues.daysBeforeStale,
              'days-before-issue-close': issues.daysBeforeClose,
              'stale-issue-message': issues.staleMessage,
              'close-issue-message': issues.closeMessage,
              'stale-issue-label': issues.staleLabel,
            },
          },
        ],
      },
    });
  }
}
