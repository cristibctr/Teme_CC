output "vpc_name" {
    value = module.vpc.vpc_name
    description = "The name of the VPC"
}

output "public_subnet_name" {
  value = module.vpc.public_subnet_name
  description = "The name of the public subnet"
}

output "private_subnet_name" {
  value = module.vpc.private_subnet_name
  description = "The name of the private subnet"
}

output "kubernetes_cluster_name" {
  value       = module.gke.kubernetes_cluster_name
  description = "GKE Cluster Name"
}

output "kubernetes_cluster_host" {
  value       = module.gke.kubernetes_cluster_host
  description = "GKE Cluster Host"
}