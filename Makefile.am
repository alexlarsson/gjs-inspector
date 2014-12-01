noinst_PROGRAMS = interactive


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

interactive_CPPFLAGS = \
	$(AM_CPPFLAGS)		\
	$(INSPECTOR_CFLAGS)

interactive_LDADD =		\
	$(INSPECTOR_LIBS)

interactive_SOURCES = interactive.cpp main.c resources.c resources.h

EXTRA_DIST =				\
	inspector.gresource.xml		\
	$(resource_files)
