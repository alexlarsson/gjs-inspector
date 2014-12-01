#include <gio/gio.h>
#include "interactive.h"

void
g_io_module_load (GIOModule *module)
{
  gtk_inspector_interactive_register (G_TYPE_MODULE (module));
}

void
g_io_module_unload (GIOModule   *module)
{
}

char **
g_io_module_query (void)
{
  char *eps[] = {
    "gtk-inspector-page",
    NULL
  };
  return g_strdupv (eps);
}

