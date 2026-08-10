using BrokerScope.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace BrokerScope.Api.Migrations;

[DbContext(typeof(AppDbContext))]
public sealed class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "8.0.8")
            .HasAnnotation("Relational:MaxIdentifierLength", 128);

        SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

        modelBuilder.Entity(
            "BrokerScope.Api.Models.ConnectionDto",
            entity =>
            {
                entity.Property<int>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("int");

                SqlServerPropertyBuilderExtensions.UseIdentityColumn(entity.Property<int>("Id"));

                entity.Property<string>("ConnectionString")
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property<string>("Name")
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.HasKey("Id");
                entity.ToTable("Connections");
            }
        );
#pragma warning restore 612, 618
    }
}
