package kr.co.studio0610.zsui

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord

@OptimizedRecord
data class ZSTabBarItem(
  @Field val key: String = "",

  @Field val name: String = "",
  @Field val title: String = "",

  @Field val icon: String? = null,

  @Field val badge: String? = null,

  @Field val accessibilityLabel: String? = null
) : Record

@OptimizedRecord
data class ZSTabBarColors(
  @Field val background: Int? = null,
  @Field val selected: Int? = null,
  @Field val selectedLabel: Int? = null,
  @Field val unselectedIcon: Int? = null,
  @Field val unselectedLabel: Int? = null,
  @Field val indicator: Int? = null,
  @Field val ripple: Int? = null,
  @Field val badgeBackground: Int? = null,
  @Field val badgeText: Int? = null
) : Record
