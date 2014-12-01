#include <gtk/gtk.h>
#include "interactive.h"

int
main (int argc,
      char *argv[])
{
  GtkWidget *window;
  GtkWidget *interactive;

  gtk_init (&argc, &argv);

  window = gtk_window_new (GTK_WINDOW_TOPLEVEL);

  gtk_window_set_default_size (GTK_WINDOW (window), 800, 600);
  interactive = g_object_new (GTK_TYPE_INSPECTOR_INTERACTIVE, NULL);

  gtk_container_add (GTK_CONTAINER (window), interactive);

  gtk_inspector_interactive_grab_focus (GTK_INSPECTOR_INTERACTIVE (interactive));

  gtk_widget_show_all (window);

  gtk_main();
  
  return 0;
}
