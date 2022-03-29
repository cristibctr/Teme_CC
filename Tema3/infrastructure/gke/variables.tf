variable "vpc_name" {
  type = string
  description = "The name of the VPC in which the Kubernetes cluster will be created"
}

variable "subnet_name" {
  type = string
  description = "The name of the subnet in which the Kubernetes cluster will be created"
}
