module "vpc" {
  source = "./vpc"
}

module "gke" {
  source = "./gke"

  vpc_name = module.vpc.vpc_name
  subnet_name = module.vpc.public_subnet_name
}

module "container_registry" {
  source = "./registry"
}
