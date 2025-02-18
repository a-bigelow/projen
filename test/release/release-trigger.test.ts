import { ReleaseTrigger } from '../../src/release/release-trigger';

let releaseTrigger: ReleaseTrigger;

describe('manual release', () => {
  beforeAll(() => {
    releaseTrigger = ReleaseTrigger.manual();
  });

  test('has a changelog by default', () => {
    expect(releaseTrigger.changelogPath).toEqual('CHANGELOG.md');
  });

  test('is not continuous', () => {
    expect(releaseTrigger.isContinuous).toBe(false);
  });

  test('does not have a schedule', () => {
    expect(releaseTrigger.schedule).toBeUndefined();
  });

  test('is manual', () => {
    expect(releaseTrigger.isManual).toBe(true);
  });

  describe('without changelog', () => {
    test('does not have a changelog', () => {
      releaseTrigger = ReleaseTrigger.manual({ changelog: false });

      expect(releaseTrigger.changelogPath).toBeUndefined();
    });

    test('ignores changelogPath', () => {
      releaseTrigger = ReleaseTrigger.manual({
        changelog: false,
        changelogPath: 'out/changelog.md',
      });

      expect(releaseTrigger.changelogPath).toBeUndefined();
    });
  });

  describe('with custom git-push command', () => {
    test('has custom git-push command', () => {
      releaseTrigger = ReleaseTrigger.manual({ gitPushCommand: 'git push --follow-tags -o ci.skip origin main' });

      expect(releaseTrigger.gitPushCommand).toEqual('git push --follow-tags -o ci.skip origin main');
    });
  });
});

describe('continuous release', () => {
  beforeAll(() => {
    releaseTrigger = ReleaseTrigger.continuous();
  });

  test('is continuous', () => {
    expect(releaseTrigger.isContinuous).toBe(true);
  });

  test('is not manual', () => {
    expect(releaseTrigger.isManual).toBe(false);
  });

  test('does not have a schedule', () => {
    expect(releaseTrigger.schedule).toBeUndefined();
  });

  test('does not have a changelog', () => {
    expect(releaseTrigger.changelogPath).toBeUndefined();
  });
});

describe('scheduled release', () => {
  let releaseSchedule = '0 17 * * *';

  beforeAll(() => {
    releaseTrigger = ReleaseTrigger.scheduled({
      schedule: releaseSchedule,
    });
  });

  test('is not continuous', () => {
    expect(releaseTrigger.isContinuous).toBe(false);
  });

  test('is not manual', () => {
    expect(releaseTrigger.isManual).toBe(false);
  });

  test('has a schedule', () => {
    expect(releaseTrigger.schedule).toEqual(releaseSchedule);
  });

  test('does not have a changelog', () => {
    expect(releaseTrigger.changelogPath).toBeUndefined();
  });
});
