#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');

export class MyEc2Stack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        // The code that defines your stack goes here
        const vpc = new ec2.Vpc(this, 'VPC');
    }
  }

new MyEc2Stack(new cdk.App(), 'MyEc2Stack');
