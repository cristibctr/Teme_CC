terraform {
  required_version = ">= 1.1.6, < 2.0.0"
 
  backend "gcs" {
      bucket = "terraform-tfstate-bucket-cc"
      prefix = "terraform/state"
  }
}