#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

m4_define(pkg_major_version, 1)
m4_define(pkg_minor_version, 41)
m4_define(pkg_micro_version, 92)
m4_define(pkg_version, pkg_major_version.pkg_minor_version.pkg_micro_version)
m4_define(pkg_int_version, (pkg_major_version * 100 + pkg_minor_version) * 100 + pkg_micro_version)

AC_PREREQ(2.61)
AC_INIT([gjs-inspector], pkg_version, [http://bugzilla.gnome.org/enter_bug.cgi?product=gjs])
AM_INIT_AUTOMAKE([dist-xz no-dist-gzip foreign])
AC_CONFIG_SRCDIR([interactive.cpp])
AC_CONFIG_HEADER([config.h])

GETTEXT_PACKAGE=gjs-inspector
AC_SUBST([GETTEXT_PACKAGE])
AC_DEFINE_UNQUOTED([GETTEXT_PACKAGE], ["$GETTEXT_PACKAGE"], [The name of the gettext domain])

AM_MAINTAINER_MODE([enable])
m4_ifdef([AM_SILENT_RULES],[AM_SILENT_RULES([yes])])

AC_PROG_CC
AM_PROG_CC_C_O
AC_PROG_CXX
AC_ISC_POSIX
AC_HEADER_STDC

# no stupid static libraries
AM_DISABLE_STATIC
# avoid libtool for LTCOMPILE, use it only to link
AC_PROG_LIBTOOL

# Checks for typedefs, structures, and compiler characteristics.
AC_C_CONST

GNOME_CXX_WARNINGS([maximum])
GNOME_MAINTAINER_MODE_DEFINES

AC_PATH_PROG(GIO_QUERYMODULES, gio-querymodules, no)

PKG_CHECK_MODULES([INSPECTOR], [gtk+-3.0 gjs-1.0])

GLIB_GSETTINGS
GLIB_COMPILE_RESOURCES=`$PKG_CONFIG --variable glib_compile_resources gio-2.0`
AC_SUBST(GLIB_COMPILE_RESOURCES)
GTK_BINARY_VERSION=`$PKG_CONFIG --variable gtk_binary_version gtk+-3.0`
AC_SUBST(GTK_BINARY_VERSION)

dnl automake 1.11/1.12 defines this but does not substitute it
AC_SUBST([pkglibexecdir], ["${libexecdir}/${PACKAGE}"])

AC_CONFIG_FILES([Makefile])
AC_OUTPUT
