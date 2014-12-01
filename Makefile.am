noinst_PROGRAMS = interactive

module_flags = -export_dynamic -avoid-version -module -no-undefined -export-symbols-regex '^g_io_module_(load|unload|query)'

resource_files = $(shell $(GLIB_COMPILE_RESOURCES) --sourcedir=$(srcdir) --generate-dependencies $(srcdir)/interactive.gresource.xml)
resources.h: interactive.gresource.xml
	$(GLIB_COMPILE_RESOURCES) $(srcdir)/interactive.gresource.xml \
		--target=$@ --sourcedir=$(srcdir) --c-name gtk_interactive --generate-header --manual-register
resources.c: interactive.gresource.xml $(resource_files)
	$(GLIB_COMPILE_RESOURCES) $(srcdir)/interactive.gresource.xml \
		--target=$@ --sourcedir=$(srcdir) --c-name gtk_interactive --generate-source --manual-register

BUILT_SOURCES =			\
	resources.h		\
	resources.c

giomodule_LTLIBRARIES = libinteractive.la
giomoduledir = $(libdir)/gtk-3.0/$(GTK_BINARY_VERSION)/inspector

libinteractive_la_CPPFLAGS = \
	$(AM_CPPFLAGS)		\
	$(INSPECTOR_CFLAGS)

libinteractive_la_LDFLAGS = $(module_flags)
libinteractive_la_LIBADD = $(INSPECTOR_LIBS)

libinteractive_la_SOURCES = interactive.cpp  resources.c resources.h inspector-module.c


interactive_CPPFLAGS = \
	$(AM_CPPFLAGS)		\
	$(INSPECTOR_CFLAGS)

interactive_LDADD = $(INSPECTOR_LIBS)
interactive_SOURCES = main.c interactive.cpp  resources.c resources.h

EXTRA_DIST =				\
	inspector.gresource.xml		\
	$(resource_files)

install-data-hook:
	if test -z "$(DESTDIR)" -a "$(GIO_QUERYMODULES)" != "no" ; then					\
		$(GIO_QUERYMODULES) $(giomoduledir) ;	\
	fi
