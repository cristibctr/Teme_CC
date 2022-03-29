resource "google_compute_network" "vpc" {
 name                    = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-vpc"
 auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public" {
  name = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-public-subnet"
  description = "The public subnet on the main VPC"
  ip_cidr_range = "10.12.16.0/24"
  network = google_compute_network.vpc.id
  region = local.env["region"]

  depends_on = [
    google_compute_network.vpc
  ]
}

resource "google_compute_subnetwork" "private" {
  name = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-private-subnet"
  description = "The private subnet on the main VPC"
  ip_cidr_range = "10.12.17.0/24"   # the IPs need to be non-overlapping!
  network = google_compute_network.vpc.id
  region = local.env["region"]

  depends_on = [
    google_compute_network.vpc
  ]
}

resource "google_compute_firewall" "allow-internal" {
  name    = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-fw-allow-internal"
  network = google_compute_network.vpc.id

  allow {
    protocol = "icmp"
  }
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  source_ranges = [
    google_compute_subnetwork.public.ip_cidr_range,
    google_compute_subnetwork.private.ip_cidr_range
  ]
}

# resource "google_compute_firewall" "allow-http" {
#   name    = "${local.env["tags"]["app_role"]}-${local.env["tags"]["environment"]}-${local.env["tags"]["creator"]}-fw-allow-http"
#   network = "${google_compute_network.vpc.name}"

#   allow {
#     protocol = "tcp"
#     ports    = ["80"]
#   }
#   allow {
#     protocol = "tcp"
#     ports    = ["443"]
#   }

#   target_tags = ["http", "https"]
# }