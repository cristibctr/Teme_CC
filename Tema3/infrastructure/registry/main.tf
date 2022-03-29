resource "google_container_registry" "registry" {
    project = local.env["project_id"]
    location = "US"
}