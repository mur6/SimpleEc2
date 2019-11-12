#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { SimpleEc2Stack } from '../lib/simple_ec2-stack';

const app = new cdk.App();
new SimpleEc2Stack(app, 'SimpleEc2Stack');
