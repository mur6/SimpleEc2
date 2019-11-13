#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');

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
        const iamRole = new iam.Role(this, 'IamRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            roleName: 'myRole',
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonEC2RoleforSSM"),
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
            ],
        });
        const profile = new iam.CfnInstanceProfile(this, 'myProfile', {
            roles: [iamRole.roleName]
        });
        const ssmaUserData = ec2.UserData.forLinux();
        const SSM_AGENT_RPM = 'https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm';
        ssmaUserData.addCommands(
            `sudo yum install -y ${SSM_AGENT_RPM}`,
            'restart amazon-ssm-agent',
            'curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo',
            'sudo yum update -y',
            'sudo yum install -y java-1.8.0-openjdk-devel.x86_64',
            'sudo yum install -y sbt git',
            'sbt --version');
        const ec2Instance = new ec2.CfnInstance(this, 'myInstance', {
            imageId: linuxImage.imageId,
            instanceType: new ec2.InstanceType('t3.large').toString(),
            keyName: 'sample-muraki',
            networkInterfaces: [{
                associatePublicIpAddress: true,
                deviceIndex: '0',
                groupSet: [securityGroup.securityGroupId],
                subnetId: vpc.publicSubnets[0].subnetId
            }],
            userData: cdk.Fn.base64(ssmaUserData.render()),
            iamInstanceProfile: profile.ref
        });
        new cdk.CfnOutput(this, 'EC2 InstanceId', { value: ec2Instance.ref });
    }
}

new MyEc2Stack(new cdk.App(), 'MyEc2Stack');
