import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import SimpleEc2 = require('../lib/simple_ec2-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SimpleEc2.SimpleEc2Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});