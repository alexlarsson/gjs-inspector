#include <gtk/gtk.h>
#include "interactive.h"

typedef struct _GFakeModule GFakeModule;
typedef struct _GFakeModuleClass GFakeModuleClass;

struct _GFakeModule {
  GTypeModule parent_instance;
};

struct _GFakeModuleClass
{
  GTypeModuleClass parent_class;
};

static void
g_fake_module_init (GFakeModule *module)
{
}

static gboolean
g_fake_module_load_module (GTypeModule *gmodule)
{
}

static void
g_fake_module_unload_module (GTypeModule *gmodule)
{
}

static void
g_fake_module_class_init (GFakeModuleClass *class)
{
  GObjectClass     *object_class      = G_OBJECT_CLASS (class);
  GTypeModuleClass *type_module_class = G_TYPE_MODULE_CLASS (class);

  type_module_class->load    = g_fake_module_load_module;
  type_module_class->unload  = g_fake_module_unload_module;
}


G_DEFINE_TYPE (GFakeModule, g_fake_module, G_TYPE_TYPE_MODULE);


int
main (int argc,
      char *argv[])
{
  GtkWidget *window;
  GtkWidget *interactive;
  GTypeModule *module;
  GIOExtensionPoint *extension_point;

  gtk_init (&argc, &argv);

  window = gtk_window_new (GTK_WINDOW_TOPLEVEL);

  gtk_window_set_default_size (GTK_WINDOW (window), 800, 600);

  extension_point = g_io_extension_point_register ("gtk-inspector-page");

  module = g_object_new (g_fake_module_get_type (), NULL);

  gtk_inspector_interactive_register (module);

  interactive = g_object_new (GTK_TYPE_INSPECTOR_INTERACTIVE, NULL);

  gtk_container_add (GTK_CONTAINER (window), interactive);

  gtk_inspector_interactive_grab_focus (GTK_INSPECTOR_INTERACTIVE (interactive));

  gtk_widget_show_all (window);

  gtk_main();

  return 0;
}
