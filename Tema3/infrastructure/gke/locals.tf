locals {
    env = yamldecode(file("${path.module}/../env.yaml"))
}