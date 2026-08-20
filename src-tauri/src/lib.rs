use tauri::{LogicalPosition, LogicalSize, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};

fn migrations() -> Vec<Migration> {
  vec![
    Migration {
      version: 1,
      description: "create_tasks_table",
      sql: "CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT NOT NULL
    );",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 2,
      description: "add_categories_and_links",
      sql: "CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );

      ALTER TABLE tasks ADD COLUMN description TEXT;
      ALTER TABLE tasks ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS task_links (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        label TEXT,
        created_at TEXT NOT NULL
      );",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 3,
      description: "generalize_task_links_to_links",
      sql: "ALTER TABLE task_links RENAME TO links_old;

      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        label TEXT,
        task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        created_at TEXT NOT NULL
      );

      INSERT INTO links (id, url, label, task_id, category_id, created_at)
      SELECT id, url, label, task_id, NULL, created_at FROM links_old;

      DROP TABLE links_old;",
      kind: MigrationKind::Up,
    },
  ]
}

const FAB_SIZE: f64 = 84.0;
const MARGIN: f64 = 20.0;

/// Positions the main window as a small floating icon anchored to the
/// bottom-right corner of the primary monitor. The frontend takes over
/// resizing/repositioning from here once the panel is toggled open.
fn position_fab(window: &tauri::WebviewWindow) -> tauri::Result<()> {
  let Some(monitor) = window.current_monitor()? else {
    return Ok(());
  };

  let scale = monitor.scale_factor();
  let screen_width = monitor.size().width as f64 / scale;
  let screen_height = monitor.size().height as f64 / scale;

  window.set_size(LogicalSize::new(FAB_SIZE, FAB_SIZE))?;
  window.set_position(LogicalPosition::new(
    screen_width - MARGIN - FAB_SIZE,
    screen_height - MARGIN - FAB_SIZE,
  ))?;

  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:tasks.db", migrations())
        .build(),
    )
    .plugin(tauri_plugin_autostart::init(
      tauri_plugin_autostart::MacosLauncher::LaunchAgent,
      None,
    ))
    .plugin(tauri_plugin_opener::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let window = app.get_webview_window("main").expect("main window not found");
      position_fab(&window)?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
