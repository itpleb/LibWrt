# Local override of feeds/packages/net/open-app-filter.
#
# The feed version fails to build against Linux 6.12 because the kernel enables
# CONFIG_WERROR, so missing prototypes and unused variables in oaf/src/app_filter.c
# become hard errors. build_dir is refreshed from the feed on every
# "scripts/feeds update", so the fix lives here instead; a package directory under
# package/ with the same name overrides the feed package (see include/scan.awk).
#
# Keep PKG_SOURCE_VERSION in sync with the feed when bumping the version.

include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/kernel.mk

PKG_NAME:=open-app-filter
PKG_RELEASE:=1

PKG_SOURCE_URL:=https://github.com/destan19/OpenAppFilter.git
PKG_SOURCE_PROTO:=git
PKG_SOURCE_DATE:=2026-04-20
PKG_SOURCE_VERSION:=569f93bfd56afc3ae8c21f13fc973926ff6629a5
PKG_MIRROR_HASH:=bdf5bcc8fc5ffbf64a318dc87d05fbacb545590224938f839b50c8f4193c1f52

PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

RSTRIP:=:

define KernelPackage/oaf
  SECTION:=Kernel
  CATEGORY:=Kernel modules
  SUBMENU:=Netfilter Extensions
  TITLE:=open app filter kernel module
  FILES:=$(PKG_BUILD_DIR)/oaf/src/oaf.ko
  DEPENDS:=+kmod-ipt-conntrack
  AUTOLOAD:=$(call AutoLoad,0,oaf)
endef

define Package/appfilter
  SECTION:=net
  CATEGORY:=Network
  DEPENDS:=+libblobmsg-json +libjson-c +libpthread +libubox +libubus +libuci +kmod-oaf
  TITLE:=App filter userspace module
endef

MAKE_PATH:=open-app-filter/src
MAKE_VARS+= LIBS="-lm -lpthread -lubox -luci -lubus -ljson-c -lblobmsg_json"

define Build/Prepare
	$(PKG_UNPACK)
	-find $(PKG_BUILD_DIR) -mindepth 1 -type f -not -name '.*' -not -name 'version.date' -printf '%T@\n' 2>/dev/null | cut -d. -f1 | sort -n | tail -n1 > $(PKG_BUILD_DIR)/version.date
	[ ! -d ./src/ ] || $(CP) ./src/. $(PKG_BUILD_DIR)
	@# fix missing prototypes / unused variables treated as errors (-Werror)
	sed -e '/#include "af_whitelist_config.h"/r $(TOPDIR)/package/open-app-filter/files/prototypes.txt' \
		"$(PKG_BUILD_DIR)/oaf/src/app_filter.c" > "$(PKG_BUILD_DIR)/oaf/src/app_filter.c.tmp" && \
	mv "$(PKG_BUILD_DIR)/oaf/src/app_filter.c.tmp" "$(PKG_BUILD_DIR)/oaf/src/app_filter.c"
	sed -e 's/u_int8_t drop = 0;/u_int8_t drop = 0; (void)drop;/g' \
		-e 's/u_int8_t smac\[ETH_ALEN\];/u_int8_t smac\[ETH_ALEN\]; (void)smac;/' \
		"$(PKG_BUILD_DIR)/oaf/src/app_filter.c" > "$(PKG_BUILD_DIR)/oaf/src/app_filter.c.tmp2" && \
	mv "$(PKG_BUILD_DIR)/oaf/src/app_filter.c.tmp2" "$(PKG_BUILD_DIR)/oaf/src/app_filter.c"
endef

define Build/Compile
	+$(KERNEL_MAKE) $(PKG_JOBS) \
		M="$(PKG_BUILD_DIR)/oaf/src" modules \
		EXTRA_CFLAGS="-Wno-error=missing-prototypes -Wno-error=unused-variable -Wno-error=format -Wno-error=implicit-fallthrough -Wno-implicit-fallthrough -Wno-error=missing-braces -Wno-error=parentheses"

	$(call Build/Compile/Default)
endef

define Package/appfilter/conffiles
/etc/config/appfilter
/etc/config/user_info
endef

define Package/appfilter/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/open-app-filter/src/oafd $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/open-app-filter/files/gen_class.sh $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/open-app-filter/files/hnat.sh $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/open-app-filter/files/oaf_rule $(1)/usr/bin/

	$(INSTALL_DIR) $(1)/etc/appfilter
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/open-app-filter/files/feature_cn.cfg $(1)/etc/appfilter/
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/open-app-filter/files/feature_en.cfg $(1)/etc/appfilter/

	$(INSTALL_DIR) $(1)/etc/config $(1)/etc/init.d
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/open-app-filter/files/appfilter.config $(1)/etc/config/appfilter
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/open-app-filter/files/user_info.config $(1)/etc/config/user_info
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/open-app-filter/files/appfilter.init $(1)/etc/init.d/appfilter
endef

$(eval $(call KernelPackage,oaf))
$(eval $(call BuildPackage,appfilter))
