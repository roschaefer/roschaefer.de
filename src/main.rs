// Reads this folder's LinkedIn "Get a copy of your data" export and the
// authoritative resume.i18n.json used by roschaefer.de, and writes each out
// as a JSON Resume-shaped file (output/resume.json, output/linkedin.json).
// Both files use the same field names, so `git diff --no-index
// output/resume.json output/linkedin.json` (or just eyeballing them side by
// side) shows what's out of sync. resume.json is the source of truth: when
// the two disagree, the fix is assumed to happen on LinkedIn.
//
// Usage: linkedin-sync [--resume=<path>] [--dir=<path>] [--out-dir=<path>]

use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

const DEFAULT_EXPORT_DIR_RELATIVE: &str = "export";
const DEFAULT_RESUME_RELATIVE: &str = "../../roschaefer.de/main/resume.i18n.json";
const DEFAULT_OUT_DIR_RELATIVE: &str = "output";

struct Args {
    dir: PathBuf,
    resume: Option<PathBuf>,
    out_dir: PathBuf,
}

fn parse_args() -> Args {
    let cwd = env::current_dir().expect("cannot read current directory");
    let mut dir = cwd.join(DEFAULT_EXPORT_DIR_RELATIVE);
    let mut resume = None;
    let mut out_dir = cwd.join(DEFAULT_OUT_DIR_RELATIVE);
    for arg in env::args().skip(1) {
        if let Some(v) = arg.strip_prefix("--dir=") {
            dir = PathBuf::from(v);
        } else if let Some(v) = arg.strip_prefix("--resume=") {
            resume = Some(PathBuf::from(v));
        } else if let Some(v) = arg.strip_prefix("--out-dir=") {
            out_dir = PathBuf::from(v);
        } else {
            eprintln!("unknown argument: {arg}");
            std::process::exit(1);
        }
    }
    Args { dir, resume, out_dir }
}

// Most string fields in resume.json are plain, but some (like `name` on
// client-confidentiality-scrubbed projects) are localized `{de, en}` objects
// instead. Accept either shape and resolve to a single display string.
#[derive(Deserialize)]
#[serde(untagged)]
enum LocalizedString {
    Plain(String),
    Localized(std::collections::HashMap<String, String>),
}

impl LocalizedString {
    fn resolve(&self) -> String {
        match self {
            LocalizedString::Plain(s) => s.clone(),
            LocalizedString::Localized(map) => map
                .get("en")
                .or_else(|| map.get("de"))
                .or_else(|| map.values().next())
                .cloned()
                .unwrap_or_default(),
        }
    }
}

#[derive(Deserialize)]
struct ResumeFile {
    basics: BasicsRaw,
    education: Vec<EducationRaw>,
    projects: Vec<ProjectRaw>,
}

#[derive(Deserialize)]
struct BasicsRaw {
    name: String,
    label: LocalizedString,
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    url: Option<String>,
    summary: LocalizedString,
    location: LocationRaw,
    #[serde(default)]
    profiles: Vec<ProfileRaw>,
}

#[derive(Deserialize)]
struct LocationRaw {
    city: LocalizedString,
    #[serde(default)]
    region: Option<String>,
    #[serde(default, rename = "countryCode")]
    country_code: Option<String>,
}

#[derive(Deserialize, Serialize, Clone)]
struct ProfileRaw {
    network: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    username: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    url: Option<String>,
}

#[derive(Deserialize)]
struct ProjectRaw {
    id: String,
    #[serde(default)]
    entity: Option<String>,
    // Confidential client names are sops-encrypted in the checked-in file
    // under this key instead of `entity`; `sops -d` decrypts the value in
    // place but keeps the key name, so we still fall back to `entity` first
    // in case a project isn't masked.
    #[serde(default, rename = "sopsEncryptedEntity")]
    sops_encrypted_entity: Option<String>,
    name: LocalizedString,
    #[serde(default)]
    roles: Vec<LocalizedString>,
    #[serde(rename = "startDate")]
    start_date: Option<String>,
    #[serde(default, rename = "endDate")]
    end_date: Option<String>,
    #[serde(default)]
    engagement: Option<String>,
    #[serde(default, rename = "type")]
    kind: Option<String>,
    #[serde(default)]
    keywords: Vec<String>,
    #[serde(default)]
    description: Option<LocalizedString>,
    #[serde(default)]
    url: Option<String>,
}

#[derive(Deserialize, Clone)]
struct EducationRaw {
    #[serde(default)]
    id: Option<String>,
    institution: String,
    #[serde(default)]
    url: Option<String>,
    #[serde(default)]
    area: Option<String>,
    #[serde(default, rename = "studyType")]
    study_type: Option<String>,
    #[serde(rename = "startDate")]
    start_date: String,
    #[serde(default, rename = "endDate")]
    end_date: Option<String>,
    #[serde(default)]
    score: Option<String>,
    #[serde(default)]
    courses: Vec<String>,
}

#[derive(Deserialize)]
struct PositionRow {
    #[serde(rename = "Company Name")]
    company: String,
    #[serde(rename = "Title")]
    title: String,
    #[serde(default, rename = "Description")]
    description: String,
    #[serde(rename = "Started On")]
    started_on: String,
    #[serde(rename = "Finished On")]
    finished_on: String,
}

#[derive(Deserialize)]
struct EducationRow {
    #[serde(rename = "School Name")]
    school: String,
    #[serde(rename = "Start Date")]
    start_date: String,
    #[serde(rename = "End Date")]
    end_date: String,
    #[serde(rename = "Degree Name")]
    degree: String,
}

#[derive(Deserialize)]
struct SkillRow {
    #[serde(rename = "Name")]
    name: String,
}

#[derive(Deserialize)]
struct ProfileRow {
    #[serde(rename = "First Name")]
    first_name: String,
    #[serde(rename = "Last Name")]
    last_name: String,
    #[serde(default, rename = "Headline")]
    headline: String,
    #[serde(default, rename = "Summary")]
    summary: String,
    #[serde(default, rename = "Geo Location")]
    geo_location: String,
    #[serde(default, rename = "Websites")]
    websites: String,
    #[serde(default, rename = "Twitter Handles")]
    twitter_handles: String,
}

#[derive(Deserialize)]
struct EmailRow {
    #[serde(rename = "Email Address")]
    address: String,
    #[serde(rename = "Primary")]
    primary: String,
}

#[derive(Serialize)]
struct OutResume {
    basics: OutBasics,
    education: Vec<OutEducation>,
    skills: Vec<OutSkill>,
    projects: Vec<OutProject>,
}

#[derive(Serialize)]
struct OutBasics {
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    summary: Option<String>,
    location: OutLocation,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    profiles: Vec<ProfileRaw>,
}

#[derive(Serialize, Default)]
struct OutLocation {
    #[serde(skip_serializing_if = "Option::is_none")]
    city: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    region: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "countryCode")]
    country_code: Option<String>,
}

#[derive(Serialize)]
struct OutEducation {
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<String>,
    institution: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    area: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "studyType")]
    study_type: Option<String>,
    #[serde(rename = "startDate")]
    start_date: String,
    #[serde(skip_serializing_if = "Option::is_none", rename = "endDate")]
    end_date: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    score: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    courses: Vec<String>,
}

#[derive(Serialize)]
struct OutSkill {
    name: String,
}

#[derive(Serialize)]
struct OutProject {
    #[serde(skip_serializing_if = "Option::is_none")]
    id: Option<String>,
    entity: String,
    // resume.json names a project/product independently of the person's
    // role on it (e.g. "Remote observatory"). LinkedIn's export has no such
    // concept — only company and title — so `name` is omitted there rather
    // than duplicating the title that's already in `roles`.
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    roles: Vec<String>,
    #[serde(rename = "startDate")]
    start_date: String,
    #[serde(skip_serializing_if = "Option::is_none", rename = "endDate")]
    end_date: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    engagement: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "type")]
    kind: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    url: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    keywords: Vec<String>,
    #[serde(skip_serializing_if = "String::is_empty")]
    description: String,
}

// Sort key only — turns "YYYY", "YYYY-MM" or "YYYY-MM-DD" into a comparable
// integer without needing exact calendar math (missing month/day default to
// the start of the period).
fn date_sort_key(s: &str) -> i64 {
    let mut parts = s.split('-');
    let y: i64 = parts.next().and_then(|p| p.parse().ok()).unwrap_or(0);
    let m: i64 = parts.next().and_then(|p| p.parse().ok()).unwrap_or(1);
    let d: i64 = parts.next().and_then(|p| p.parse().ok()).unwrap_or(1);
    y * 10_000 + m * 100 + d
}

fn sort_projects_desc(projects: &mut [OutProject]) {
    projects.sort_by_key(|p| std::cmp::Reverse(date_sort_key(&p.start_date)));
}

fn sort_education_desc(education: &mut [OutEducation]) {
    education.sort_by_key(|e| std::cmp::Reverse(date_sort_key(&e.start_date)));
}

const MONTHS: [&str; 12] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// LinkedIn only has month precision ("Mar 2026"); JSON Resume's date format
// accepts a bare "YYYY-MM", so that's the most precise honest value to emit.
fn linkedin_date_to_iso(s: &str) -> Option<String> {
    let s = s.trim();
    if s.is_empty() {
        return None;
    }
    let mut parts = s.split_whitespace();
    let mon = parts.next()?;
    let year = parts.next()?;
    let month_index = MONTHS.iter().position(|m| *m == mon)? + 1;
    Some(format!("{year}-{month_index:02}"))
}

// LinkedIn encodes extra links as comma-separated "[LABEL:url]" chunks in
// both the Websites and Twitter Handles export columns.
fn parse_bracketed_profiles(field: &str) -> Vec<ProfileRaw> {
    let mut profiles = Vec::new();
    for chunk in field.split(']') {
        let chunk = chunk.trim().trim_start_matches(',').trim();
        let Some(inner) = chunk.strip_prefix('[') else { continue };
        let Some((network, url)) = inner.split_once(':') else { continue };
        if url.trim().is_empty() {
            continue;
        }
        profiles.push(ProfileRaw {
            network: network.trim().to_string(),
            username: None,
            url: Some(url.trim().to_string()),
        });
    }
    profiles
}

fn parse_geo_location(s: &str) -> OutLocation {
    let parts: Vec<&str> = s.split(',').map(str::trim).filter(|p| !p.is_empty()).collect();
    OutLocation {
        city: parts.first().map(|p| p.to_string()),
        region: if parts.len() > 1 { Some(parts[1..].join(", ")) } else { None },
        country_code: None,
    }
}

fn read_csv<T: for<'de> Deserialize<'de>>(path: &Path) -> Vec<T> {
    if !path.exists() {
        return Vec::new();
    }
    let mut reader = csv::Reader::from_path(path).expect("failed to open CSV");
    reader
        .deserialize()
        .filter_map(|row: Result<T, _>| row.ok())
        .collect()
}

// resume.json is partially sops-encrypted (confidential client names live
// under sopsEncryptedEntity/sopsEncryptedUrl). Reading the file raw leaves
// those fields ciphertext. Detect that and shell out to `sops -d` to get the
// plaintext instead.
fn is_sops_encrypted(text: &str) -> bool {
    serde_json::from_str::<serde_json::Value>(text)
        .ok()
        .and_then(|v| v.as_object().map(|o| o.contains_key("sops")))
        .unwrap_or(false)
}

fn read_resume_text(path: &Path) -> String {
    let raw = std::fs::read_to_string(path).expect("failed to read resume.json");
    if !is_sops_encrypted(&raw) {
        return raw;
    }

    let output = std::process::Command::new("sops")
        .arg("-d")
        .arg(path)
        .output()
        .expect("resume.json is sops-encrypted but `sops` is not on PATH — install it from https://github.com/getsops/sops");

    if !output.status.success() {
        eprintln!("`sops -d {}` failed:\n{}", path.display(), String::from_utf8_lossy(&output.stderr));
        std::process::exit(1);
    }

    String::from_utf8(output.stdout).expect("sops output was not valid UTF-8")
}

fn build_resume_out(resume: ResumeFile) -> OutResume {
    let basics = OutBasics {
        name: resume.basics.name,
        label: Some(resume.basics.label.resolve()),
        email: resume.basics.email,
        url: resume.basics.url,
        summary: Some(resume.basics.summary.resolve()),
        location: OutLocation {
            city: Some(resume.basics.location.city.resolve()),
            region: resume.basics.location.region,
            country_code: resume.basics.location.country_code,
        },
        profiles: resume.basics.profiles,
    };

    let mut education: Vec<OutEducation> = resume
        .education
        .into_iter()
        .map(|e| OutEducation {
            id: e.id,
            institution: e.institution,
            url: e.url,
            area: e.area,
            study_type: e.study_type,
            start_date: e.start_date,
            end_date: e.end_date,
            score: e.score,
            courses: e.courses,
        })
        .collect();
    sort_education_desc(&mut education);

    let mut all_keywords: HashSet<String> = HashSet::new();
    for p in &resume.projects {
        all_keywords.extend(p.keywords.iter().cloned());
    }
    let mut skills: Vec<OutSkill> = all_keywords.into_iter().map(|name| OutSkill { name }).collect();
    skills.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    let mut projects: Vec<OutProject> = resume
        .projects
        .into_iter()
        .filter_map(|p| {
            let start_date = p.start_date?;
            Some(OutProject {
                id: Some(p.id),
                entity: p.entity.or(p.sops_encrypted_entity).unwrap_or_default(),
                name: Some(p.name.resolve()),
                roles: p.roles.iter().map(LocalizedString::resolve).collect(),
                start_date,
                end_date: p.end_date,
                engagement: p.engagement,
                kind: p.kind,
                url: p.url,
                keywords: p.keywords,
                description: p.description.as_ref().map(LocalizedString::resolve).unwrap_or_default(),
            })
        })
        .collect();
    sort_projects_desc(&mut projects);

    OutResume { basics, education, skills, projects }
}

fn build_linkedin_out(dir: &Path) -> OutResume {
    let profile_rows: Vec<ProfileRow> = read_csv(&dir.join("Profile.csv"));
    let email_rows: Vec<EmailRow> = read_csv(&dir.join("Email Addresses.csv"));
    let position_rows: Vec<PositionRow> = read_csv(&dir.join("Positions.csv"));
    let education_rows: Vec<EducationRow> = read_csv(&dir.join("Education.csv"));
    let skill_rows: Vec<SkillRow> = read_csv(&dir.join("Skills.csv"));

    let profile = profile_rows.into_iter().next();
    let email = email_rows
        .iter()
        .find(|e| e.primary.eq_ignore_ascii_case("yes"))
        .or_else(|| email_rows.first())
        .map(|e| e.address.clone());

    let basics = match profile {
        Some(p) => {
            let mut profiles = parse_bracketed_profiles(&p.websites);
            profiles.extend(parse_bracketed_profiles(&p.twitter_handles));
            OutBasics {
                name: format!("{} {}", p.first_name, p.last_name).trim().to_string(),
                label: (!p.headline.trim().is_empty()).then(|| p.headline.trim().to_string()),
                email,
                url: None,
                summary: (!p.summary.trim().is_empty()).then(|| p.summary.trim().to_string()),
                location: parse_geo_location(&p.geo_location),
                profiles,
            }
        }
        None => OutBasics {
            name: String::new(),
            label: None,
            email,
            url: None,
            summary: None,
            location: OutLocation::default(),
            profiles: Vec::new(),
        },
    };

    let mut projects: Vec<OutProject> = position_rows
        .into_iter()
        .filter_map(|row| {
            let start_date = linkedin_date_to_iso(&row.started_on)?;
            let title = row.title.trim().to_string();
            Some(OutProject {
                id: None,
                entity: row.company.trim().to_string(),
                name: None,
                roles: vec![title],
                start_date,
                end_date: linkedin_date_to_iso(&row.finished_on),
                engagement: None,
                kind: None,
                url: None,
                keywords: Vec::new(),
                description: row.description.trim().to_string(),
            })
        })
        .collect();
    sort_projects_desc(&mut projects);

    let mut education: Vec<OutEducation> = education_rows
        .into_iter()
        .map(|row| OutEducation {
            id: None,
            institution: row.school,
            url: None,
            area: None,
            study_type: (!row.degree.trim().is_empty()).then(|| row.degree.trim().to_string()),
            start_date: row.start_date,
            end_date: (!row.end_date.trim().is_empty()).then(|| row.end_date.trim().to_string()),
            score: None,
            courses: Vec::new(),
        })
        .collect();
    sort_education_desc(&mut education);

    let mut skills: Vec<OutSkill> = skill_rows.into_iter().map(|row| OutSkill { name: row.name }).collect();
    skills.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    skills.dedup_by(|a, b| a.name.eq_ignore_ascii_case(&b.name));

    OutResume { basics, education, skills, projects }
}

fn write_json(path: &Path, value: &OutResume) {
    let json = serde_json::to_string_pretty(value).expect("failed to serialize JSON");
    fs::write(path, json + "\n").unwrap_or_else(|e| panic!("failed to write {}: {e}", path.display()));
}

fn main() {
    let args = parse_args();

    let resume_path = args
        .resume
        .clone()
        .unwrap_or_else(|| args.dir.join(DEFAULT_RESUME_RELATIVE));

    if !resume_path.exists() {
        eprintln!(
            "resume.json not found at {}. Pass --resume=<path>.",
            resume_path.display()
        );
        std::process::exit(1);
    }

    let resume_text = read_resume_text(&resume_path);
    let resume: ResumeFile = serde_json::from_str(&resume_text).expect("failed to parse resume.json");

    let resume_out = build_resume_out(resume);
    let linkedin_out = build_linkedin_out(&args.dir);

    fs::create_dir_all(&args.out_dir)
        .unwrap_or_else(|e| panic!("failed to create {}: {e}", args.out_dir.display()));

    let resume_out_path = args.out_dir.join("resume.json");
    let linkedin_out_path = args.out_dir.join("linkedin.json");
    write_json(&resume_out_path, &resume_out);
    write_json(&linkedin_out_path, &linkedin_out);

    println!("wrote {}", resume_out_path.display());
    println!("wrote {}", linkedin_out_path.display());
    println!(
        "\nCompare with: git diff --no-index {} {}",
        resume_out_path.display(),
        linkedin_out_path.display()
    );
}
