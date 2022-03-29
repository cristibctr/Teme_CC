# GKE cluster
resource "google_container_cluster" "gke" {
  name     = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-gke"
  location = local.env["zone"]

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = var.vpc_name
  subnetwork = var.subnet_name
}

# Separately Managed Node Pool
resource "google_container_node_pool" "gke_nodes" {
  name       = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-node-pool"
  location   = local.env["zone"]
  cluster    = google_container_cluster.gke.name
  node_count = local.env["gke"]["num_nodes"]

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only"    # Needed for access to Container Registry
    ]

    labels = {for key, value in local.env["tags"]: key => value}

    machine_type = "e2-small"
    tags         = ["gke-node", "${local.env["project_id"]}-gke"]
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  node_locations = [
      local.env["zone"]
  ]
}
