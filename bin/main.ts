#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');

export class MyEc2Stack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const vpc = new ec2.Vpc(this, 'VpcForGatling', {
            maxAzs: 1,
            subnetConfiguration: [
                {
                  subnetType: ec2.SubnetType.PUBLIC,
                  name: 'Ingress'
                }
            ]
        });
        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow all outbound from ec2 instances',
            allowAllOutbound: true
        });
        const linuxImage = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
        }).getImage(this);
        const ec2Instance = new ec2.CfnInstance(this, 'myInstance', {
            imageId: linuxImage.imageId,
            instanceType: new ec2.InstanceType('t3.small').toString(),
            networkInterfaces: [{
              associatePublicIpAddress: true,
              deviceIndex: '0',
              groupSet: [securityGroup.securityGroupId],
              subnetId: vpc.publicSubnets[0].subnetId
            }]
        });
    }
  }

new MyEc2Stack(new cdk.App(), 'MyEc2Stack');
